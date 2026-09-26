import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, QrCode, Image as ImageIcon, X } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { todayISO } from '../../lib/format';

interface InvoiceDataFromQR {
  amount?: number;
  description?: string;
  date?: string;
  rfc?: string;
  uuid?: string;
  vendor?: string;
}

export interface ScanTicketModalProps {
  visible: boolean;
  onClose: () => void;
  onScanComplete?: (data: {
    amount: number;
    description: string;
    date: string;
    invoiceData?: {
      rfc?: string;
      uuid?: string;
      vendor?: string;
      rawQRData?: string;
    };
  }) => void;
}

type ScanStatus = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

const onlyDigitsAndDot = (value: string) => value.replace(/[^0-9.]/g, '');

/** Lee los params de un QR CFDI sin depender de la API web URL. */
function parseQuery(qrContent: string): Record<string, string> {
  const query = qrContent.split('?')[1] ?? '';
  const result: Record<string, string> = {};
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const [rawKey, rawValue = ''] = pair.split('=');
    try {
      result[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
    } catch {
      result[rawKey] = rawValue;
    }
  }
  return result;
}

const parseQRData = (qrContent: string): InvoiceDataFromQR => {
  const data: InvoiceDataFromQR = {};

  try {
    if (qrContent.trim().startsWith('{')) {
      const json = JSON.parse(qrContent) as Record<string, unknown>;
      return {
        amount: Number(json.total ?? json.amount ?? json.monto ?? 0) || undefined,
        description: String(json.description ?? json.concepto ?? json.vendor ?? 'Factura escaneada'),
        date: String(json.date ?? json.fecha ?? todayISO()),
        rfc: json.rfc ? String(json.rfc) : undefined,
        uuid: json.uuid || json.folio ? String(json.uuid ?? json.folio) : undefined,
        vendor: json.vendor || json.emisor ? String(json.vendor ?? json.emisor) : undefined,
      };
    }

    if (qrContent.includes('sat.gob.mx') || qrContent.includes('verificacfdi')) {
      const params = parseQuery(qrContent);
      if (params.tt) data.amount = Number(onlyDigitsAndDot(params.tt)) || undefined;
      if (params.re) data.rfc = params.re;
      if (params.id) data.uuid = params.id;
      if (params.fe) data.date = params.fe;
      data.description = data.rfc ? `Factura de ${data.rfc}` : 'Factura CFDI';
      data.vendor = data.rfc;
      return data;
    }

    if (qrContent.includes('|') || qrContent.includes(':')) {
      qrContent.split(/[|\n&]/).forEach((pair) => {
        const [rawKey, ...rest] = pair.split(/[:=]/);
        const value = rest.join(':').trim();
        const key = rawKey?.toLowerCase().trim();
        if (!key) return;
        if (['total', 'monto', 'amount', 'importe'].some((token) => key.includes(token))) {
          data.amount = Number(onlyDigitsAndDot(value)) || undefined;
        }
        if (['fecha', 'date'].some((token) => key.includes(token))) data.date = value;
        if (['concepto', 'desc'].some((token) => key.includes(token))) data.description = value;
        if (key.includes('rfc')) data.rfc = value;
        if (['uuid', 'folio', 'serial'].some((token) => key.includes(token))) data.uuid = value;
        if (['emisor', 'vendor', 'comercio', 'tienda'].some((token) => key.includes(token))) {
          data.vendor = value;
        }
      });
      if (!data.description && data.vendor) data.description = `Compra en ${data.vendor}`;
      return data;
    }

    const numeric = Number(onlyDigitsAndDot(qrContent));
    if (!Number.isNaN(numeric) && numeric > 0) {
      data.amount = numeric;
      data.description = 'Pago escaneado';
    }
  } catch (error) {
    if (__DEV__) console.warn('No se pudo leer el QR:', error);
  }

  return data;
};

export default function ScanTicketModal({ visible, onClose, onScanComplete }: ScanTicketModalProps) {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [rawQRData, setRawQRData] = useState('');
  const [parsedInvoice, setParsedInvoice] = useState<InvoiceDataFromQR>({});
  const [extracted, setExtracted] = useState({ amount: '', description: '', date: todayISO() });
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage('');
    setRawQRData('');
    setParsedInvoice({});
    setExtracted({ amount: '', description: '', date: todayISO() });
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (!visible) reset();
  }, [visible, reset]);

  const handleQRContent = (content: string) => {
    setCameraActive(false);
    setStatus('processing');
    setRawQRData(content);

    const parsed = parseQRData(content);
    setParsedInvoice(parsed);
    setExtracted({
      amount: parsed.amount ? String(parsed.amount) : '',
      description: parsed.description ?? 'Gasto escaneado',
      date: parsed.date ?? todayISO(),
    });
    setStatus('success');
  };

  const startCameraScan = async () => {
    setErrorMessage('');

    if (!permission) {
      setStatus('error');
      setErrorMessage('No pudimos verificar el permiso de cámara.');
      return;
    }

    if (!permission.granted) {
      if (permission.canAskAgain) {
        const result = await requestPermission();
        if (!result.granted) {
          setStatus('error');
          setErrorMessage('Necesitamos acceso a la cámara para leer el QR.');
          return;
        }
      } else {
        Alert.alert(
          'Permiso denegado',
          'Activa el acceso a la cámara desde la configuración de la app.',
          [{ text: 'Abrir ajustes', onPress: () => void Linking.openSettings() }, { text: 'Cancelar' }],
        );
        return;
      }
    }

    setStatus('scanning');
    setCameraActive(true);
  };

  const pickImageAndScan = async () => {
    setErrorMessage('');
    const library = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });

    if (library.canceled || !library.assets?.[0]?.uri) {
      setStatus('idle');
      return;
    }

    setStatus('processing');
    try {
      // expo-camera decodifica QR desde un archivo local (reemplaza al libreria web)
      const results = await CameraView.scanFromURLAsync(library.assets[0].uri, ['qr']);
      const first = results?.[0]?.data;

      if (!first) {
        setStatus('error');
        setErrorMessage('No encontramos un código QR legible en la imagen.');
        return;
      }

      handleQRContent(first);
    } catch (error) {
      if (__DEV__) console.warn('Error decodificando imagen:', error);
      setStatus('error');
      setErrorMessage('No se pudo leer la imagen. Prueba con la cámara o otra foto.');
    }
  };

  const handleConfirm = () => {
    const value = Number(extracted.amount);
    if (!value || value <= 0) {
      setErrorMessage('Ingresa un monto válido antes de guardar.');
      setStatus('error');
      return;
    }

    onScanComplete?.({
      amount: value,
      description: extracted.description || 'Compra escaneada',
      date: extracted.date || todayISO(),
      invoiceData: {
        rfc: parsedInvoice.rfc,
        uuid: parsedInvoice.uuid,
        vendor: parsedInvoice.vendor,
        rawQRData,
      },
    });

    reset();
    onClose();
  };

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <View>
            <Text className="text-sm text-muted-foreground text-center mb-4">
              Escanea el código QR de tu factura para capturar el monto y los datos fiscales.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={startCameraScan}
                className="flex-1 items-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6"
              >
                <Camera size={36} color="#6366f1" />
                <Text className="text-sm font-semibold text-primary mt-2">Usar cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImageAndScan}
                className="flex-1 items-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-6"
              >
                <ImageIcon size={36} color="#64748b" />
                <Text className="text-sm font-semibold text-muted-foreground mt-2">Subir imagen</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-muted rounded-2xl p-3 mt-4">
              <Text className="text-xs text-muted-foreground text-center">
                Compatible con facturas CFDI (SAT), QR bancarios y tickets con formato clave:valor
              </Text>
            </View>
          </View>
        );

      case 'scanning':
        return (
          <View>
            <View
              className="rounded-2xl overflow-hidden bg-black"
              style={{ height: 320 }}
            >
              {cameraActive && Platform.OS !== 'web' && (
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={(event) => {
                    if (status === 'scanning' && event?.data) handleQRContent(event.data);
                  }}
                />
              )}
            </View>

            <Text className="text-sm text-center text-muted-foreground mt-3">
              Buscando código QR…
            </Text>
            <TouchableOpacity
              onPress={reset}
              className="rounded-2xl border border-border py-3 items-center mt-2"
            >
              <Text className="text-foreground font-medium">Cancelar</Text>
            </TouchableOpacity>
          </View>
        );

      case 'processing':
        return (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#6366f1" />
            <Text className="mt-3 text-sm font-medium text-foreground">Procesando datos…</Text>
          </View>
        );

      case 'error':
        return (
          <View>
            <View className="bg-destructive/10 border border-destructive/25 rounded-2xl p-4">
              <Text className="text-sm text-destructive font-medium">❌ {errorMessage}</Text>
            </View>
            <TouchableOpacity
              onPress={reset}
              className="rounded-2xl border border-border py-3 items-center mt-4"
            >
              <Text className="text-foreground font-medium">Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        );

      case 'success':
        return (
          <View>
            <View className="bg-income/10 border border-income/25 rounded-2xl p-3 mb-4">
              <Text className="text-sm text-income font-medium">
                ✓ Código QR leído correctamente
              </Text>
            </View>

            {(parsedInvoice.rfc || parsedInvoice.uuid || parsedInvoice.vendor) && (
              <View className="bg-muted rounded-2xl p-3 mb-4">
                <Text className="text-xs font-semibold text-muted-foreground mb-2">
                  Datos detectados
                </Text>
                {!!parsedInvoice.vendor && (
                  <Text className="text-xs text-foreground">Proveedor: {parsedInvoice.vendor}</Text>
                )}
                {!!parsedInvoice.rfc && (
                  <Text className="text-xs text-foreground font-mono">RFC: {parsedInvoice.rfc}</Text>
                )}
                {!!parsedInvoice.uuid && (
                  <Text className="text-xs text-foreground font-mono" numberOfLines={1}>
                    UUID: {parsedInvoice.uuid}
                  </Text>
                )}
              </View>
            )}

            <Text className="text-sm font-medium text-foreground mb-1.5">Monto</Text>
            <TextInput
              value={extracted.amount}
              onChangeText={(text) => setExtracted((prev) => ({ ...prev, amount: text }))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94a3b8"
              className="rounded-2xl border border-border bg-white px-4 py-3 text-lg font-semibold text-foreground mb-4"
            />

            <Text className="text-sm font-medium text-foreground mb-1.5">Descripción</Text>
            <TextInput
              value={extracted.description}
              onChangeText={(text) => setExtracted((prev) => ({ ...prev, description: text }))}
              placeholder="Descripción del gasto"
              placeholderTextColor="#94a3b8"
              className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground mb-4"
            />

            <Text className="text-sm font-medium text-foreground mb-1.5">Fecha</Text>
            <TextInput
              value={extracted.date}
              onChangeText={(text) => setExtracted((prev) => ({ ...prev, date: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground mb-5"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={reset}
                className="flex-1 rounded-2xl border border-border py-3.5 items-center"
              >
                <Text className="text-foreground font-semibold">Escanear otro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={!extracted.amount}
                className={cn(
                  'flex-1 rounded-2xl bg-primary py-3.5 items-center',
                  !extracted.amount && 'opacity-50',
                )}
              >
                <Text className="text-white font-semibold">Guardar gasto</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-card rounded-t-3xl border-t border-border">
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <QrCode size={20} color="#6366f1" />
                <Text className="text-xl font-bold text-foreground">Escanear factura</Text>
              </View>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" className="p-2 -mr-2">
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
