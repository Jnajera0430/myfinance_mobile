import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Camera, QrCode, Image as ImageIcon, X } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
// import QRCodeDecoder from 'react-native-qrcode-decoder';
import { cn } from '../../lib/utils';
import { LinearGradient } from 'expo-linear-gradient';

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
      scannedAt?: string;
    };
  }) => void;
}

type ScanStatus = 'idle' | 'scanning' | 'processing' | 'success' | 'error';

// Reuse the same QR parsing logic (pure JS, works in RN)
const parseQRData = (qrContent: string): InvoiceDataFromQR => {
  const data: InvoiceDataFromQR = {};
  
  try {
    if (qrContent.startsWith('{')) {
      const jsonData = JSON.parse(qrContent);
      return {
        amount: jsonData.total || jsonData.amount || jsonData.monto,
        description: jsonData.description || jsonData.concepto || jsonData.vendor || 'Factura escaneada',
        date: jsonData.date || jsonData.fecha || new Date().toISOString().split('T')[0],
        rfc: jsonData.rfc,
        uuid: jsonData.uuid || jsonData.folio,
        vendor: jsonData.vendor || jsonData.emisor,
      };
    }

    if (qrContent.includes('sat.gob.mx') || qrContent.includes('verificacfdi')) {
      // For React Native, URL parsing is similar but we need to use a workaround
      let url;
      try {
        url = new URL(qrContent);
      } catch {
        // If URL parsing fails, use regex
        const ttMatch = qrContent.match(/[?&]tt=([^&]+)/);
        if (ttMatch) data.amount = parseFloat(ttMatch[1].replace(/[^0-9.]/g, ''));
        const reMatch = qrContent.match(/[?&]re=([^&]+)/);
        if (reMatch) data.rfc = reMatch[1];
        const idMatch = qrContent.match(/[?&]id=([^&]+)/);
        if (idMatch) data.uuid = idMatch[1];
        const feMatch = qrContent.match(/[?&]fe=([^&]+)/);
        if (feMatch) data.date = feMatch[1];
        data.description = data.rfc ? `Factura de ${data.rfc}` : 'Factura CFDI';
        data.vendor = data.rfc || undefined;
        return data;
      }
      const params = url.searchParams;
      const totalStr = params.get('tt');
      if (totalStr) data.amount = parseFloat(totalStr.replace(/[^0-9.]/g, ''));
      data.rfc = params.get('re') || undefined;
      data.uuid = params.get('id') || undefined;
      const fecha = params.get('fe');
      if (fecha) data.date = fecha;
      data.description = data.rfc ? `Factura de ${data.rfc}` : 'Factura CFDI';
      data.vendor = data.rfc || undefined;
      return data;
    }

    // key=value parsing (same as web)
    if (qrContent.includes('|') || qrContent.includes(':')) {
      const pairs = qrContent.split(/[|&\n]/);
      pairs.forEach(pair => {
        const [key, value] = pair.split(/[:=]/).map(s => s.trim());
        const keyLower = key?.toLowerCase();
        if (keyLower?.includes('total') || keyLower?.includes('monto') || keyLower?.includes('amount')) {
          data.amount = parseFloat(value?.replace(/[^0-9.]/g, '') || '0');
        }
        if (keyLower?.includes('fecha') || keyLower?.includes('date')) data.date = value;
        if (keyLower?.includes('concepto') || keyLower?.includes('desc')) data.description = value;
        if (keyLower?.includes('rfc')) data.rfc = value;
        if (keyLower?.includes('uuid') || keyLower?.includes('folio')) data.uuid = value;
        if (keyLower?.includes('emisor') || keyLower?.includes('vendor')) data.vendor = value;
      });
      if (!data.description && data.vendor) data.description = `Compra en ${data.vendor}`;
      return data;
    }

    const numericValue = parseFloat(qrContent.replace(/[^0-9.]/g, ''));
    if (!isNaN(numericValue) && numericValue > 0) {
      data.amount = numericValue;
      data.description = 'Pago escaneado';
    }
  } catch (error) {
    console.error('Error parsing QR data:', error);
  }
  return data;
};

const ScanTicketModal = ({ visible, onClose, onScanComplete }: ScanTicketModalProps) => {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [rawQRData, setRawQRData] = useState<string>('');
  const [parsedInvoice, setParsedInvoice] = useState<InvoiceDataFromQR>({});
  const [extractedData, setExtractedData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef<any>(null);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      handleReset();
      setIsCameraActive(false);
    }
  }, [visible]);

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
    setRawQRData('');
    setParsedInvoice({});
    setExtractedData({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsCameraActive(false);
  };

  const handleQRSuccess = async (qrContent: string) => {
    setStatus('processing');
    setRawQRData(qrContent);
    const parsed = parseQRData(qrContent);
    setParsedInvoice(parsed);
    setExtractedData({
      amount: parsed.amount?.toString() || '',
      description: parsed.description || 'Gasto escaneado',
      date: parsed.date || new Date().toISOString().split('T')[0],
    });
    setStatus('success');
  };

  const startCameraScan = async () => {
    if (!cameraPermission) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        setStatus('error');
        setErrorMessage('Se requiere permiso de cámara para escanear QR.');
        return;
      }
    }
    setStatus('scanning');
    setIsCameraActive(true);
    setErrorMessage('');
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (status === 'scanning') {
      // Stop scanning after first detection to avoid multiple triggers
      setIsCameraActive(false);
      handleQRSuccess(data);
    }
  };

  const pickImageAndScan = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus !== 'granted') {
      setStatus('error');
      setErrorMessage('Se requiere permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setStatus('processing');
      try {
        // const qrData = await QRCodeDecoder.decode(result.assets[0].uri);
        // if (qrData) {
        //   await handleQRSuccess(qrData);
        // } else {
        //   throw new Error('No QR code found');
        // }
      } catch (error: any) {
        console.error('QR decode error:', error);
        setStatus('error');
        setErrorMessage('No se encontró ningún código QR en la imagen. Asegúrate de que sea visible.');
      }
    } else {
      // User cancelled
      setStatus('idle');
    }
  };

  const handleConfirm = () => {
    if (onScanComplete && extractedData.amount) {
      onScanComplete({
        amount: parseFloat(extractedData.amount),
        description: extractedData.description,
        date: extractedData.date,
        invoiceData: {
          rfc: parsedInvoice.rfc,
          uuid: parsedInvoice.uuid,
          vendor: parsedInvoice.vendor,
          rawQRData,
          scannedAt: new Date().toISOString(),
        },
      });
    }
    handleReset();
    onClose();
  };

  // Render different screens based on status
  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <View className="space-y-4">
            <Text className="text-sm text-muted-foreground text-center">
              Escanea el código QR de tu factura para capturar automáticamente los datos
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={startCameraScan}
                className="flex-1 items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5"
              >
                <Camera size={40} color="#3b82f6" />
                <Text className="text-sm font-medium text-primary">Usar Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImageAndScan}
                className="flex-1 items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border bg-muted/30"
              >
                <ImageIcon size={40} color="#6b7280" />
                <Text className="text-sm font-medium text-muted-foreground">Subir Imagen</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-muted/50 rounded-lg p-3">
              <Text className="text-xs text-muted-foreground text-center">
                💡 Compatible con facturas CFDI (SAT), códigos QR bancarios y formatos estándar
              </Text>
            </View>
          </View>
        );

      case 'scanning':
        return (
          <View className="space-y-4">
            <View className="relative rounded-lg overflow-hidden bg-black aspect-square">
              {isCameraActive && (
                <CameraView
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={handleBarCodeScanned}
                />
              )}
              <View className="absolute inset-0 items-center justify-center">
                <View className="w-56 h-56 border-2 border-primary rounded-lg" />
              </View>
            </View>
            <Text className="text-sm text-center text-muted-foreground">
              🔍 Buscando código QR...
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsCameraActive(false);
                handleReset();
              }}
              className="py-3 rounded-lg border border-border items-center"
            >
              <Text className="text-foreground">Cancelar</Text>
            </TouchableOpacity>
          </View>
        );

      case 'processing':
        return (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-3 text-sm font-medium text-foreground">Procesando datos...</Text>
          </View>
        );

      case 'error':
        return (
          <View className="space-y-4">
            <View className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <Text className="text-sm text-destructive font-medium">❌ {errorMessage}</Text>
            </View>
            <TouchableOpacity
              onPress={handleReset}
              className="py-3 rounded-lg border border-border items-center"
            >
              <Text className="text-foreground">Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        );

      case 'success':
        return (
          <View className="space-y-4">
            <View className="bg-income/10 border border-income/30 rounded-lg p-3">
              <Text className="text-sm text-income font-medium">✅ ¡Código QR leído correctamente!</Text>
            </View>

            {(parsedInvoice.rfc || parsedInvoice.uuid) && (
              <View className="bg-muted/50 rounded-lg p-3 space-y-1">
                <Text className="text-xs font-medium text-muted-foreground mb-2">Datos fiscales detectados:</Text>
                {parsedInvoice.rfc && (
                  <Text className="text-xs">
                    <Text className="text-muted-foreground">RFC:</Text> <Text className="font-mono">{parsedInvoice.rfc}</Text>
                  </Text>
                )}
                {parsedInvoice.uuid && (
                  <Text className="text-xs">
                    <Text className="text-muted-foreground">UUID:</Text> <Text className="font-mono text-[10px]">{parsedInvoice.uuid}</Text>
                  </Text>
                )}
              </View>
            )}

            <View className="space-y-3">
              <View className="space-y-2">
                <Text className="text-sm font-medium text-foreground">Monto</Text>
                <View className="relative flex-row items-center">
                  <Text className="absolute left-3 text-muted-foreground">$</Text>
                  <TextInput
                    value={extractedData.amount}
                    onChangeText={(text) => setExtractedData(prev => ({ ...prev, amount: text }))}
                    keyboardType="numeric"
                    placeholder="0.00"
                    className="flex-1 border border-border rounded-lg px-8 py-3 text-foreground bg-muted/30 text-lg font-semibold"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View className="space-y-2">
                <Text className="text-sm font-medium text-foreground">Descripción</Text>
                <TextInput
                  value={extractedData.description}
                  onChangeText={(text) => setExtractedData(prev => ({ ...prev, description: text }))}
                  placeholder="Descripción del gasto"
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-muted/30"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="space-y-2">
                <Text className="text-sm font-medium text-foreground">Fecha</Text>
                <TextInput
                  value={extractedData.date}
                  onChangeText={(text) => setExtractedData(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-muted/30"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleReset}
                className="flex-1 py-3 rounded-lg border border-border items-center"
              >
                <Text className="text-foreground">Escanear otro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={!extractedData.amount}
                className={cn(
                  "flex-1 py-3 rounded-lg bg-primary items-center",
                  !extractedData.amount && "opacity-50"
                )}
              >
                <Text className="text-primary-foreground font-medium">Guardar gasto</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="bg-card rounded-t-3xl border-t border-border max-h-[90%]"
        >
          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <QrCode size={20} color="#3b82f6" />
                <Text className="text-xl font-bold text-foreground">Escanear Factura QR 📸</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="p-2">
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            {renderContent()}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default ScanTicketModal;