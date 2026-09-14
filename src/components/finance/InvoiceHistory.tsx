import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Receipt, FileText, Copy, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFinance } from '../../contexts/FinanceContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const InvoiceHistory = () => {
  const { scannedInvoices } = useFinance();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard =  (text: string, id: string) => {
    Clipboard.setString(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const invoicesToShow = scannedInvoices;

  if (invoicesToShow.length === 0) {
    return (
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="bg-card rounded-2xl overflow-hidden border border-border"
      >
        <View className="p-5">
          <View className="flex-row items-center gap-2 mb-3">
            <Receipt size={20} className="text-primary" />
            <Text className="text-lg font-semibold text-foreground">
              Facturas Escaneadas
            </Text>
          </View>
          <View className="items-center py-8">
            <FileText size={48} className="text-muted-foreground/30 mb-3" />
            <Text className="text-sm text-muted-foreground text-center">
              Aún no has escaneado ninguna factura
            </Text>
            <Text className="text-xs text-muted-foreground text-center mt-1">
              Usa el botón + para escanear códigos QR de tus facturas
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const renderInvoiceItem = ({ item: invoice }: { item: any }) => (
    <View className="p-4 rounded-xl border border-border bg-muted/30 mb-3">
      {/* Header Row */}
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="font-medium text-sm text-foreground">
            {invoice.description}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {formatDate(invoice.date)}
          </Text>
        </View>
        <Text className="text-lg font-bold text-foreground">
          ${invoice.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Fiscal Data */}
      {invoice.invoiceData && (
        <View className="pt-2 border-t border-border/50 space-y-2">
          {/* RFC */}
          {invoice.invoiceData.rfc && (
            <View className="flex-row justify-between items-center gap-2">
              <View className="flex-row items-center gap-2 flex-1">
                <Text className="text-xs text-muted-foreground shrink-0">RFC:</Text>
                <Text className="text-xs font-mono flex-1" numberOfLines={1}>
                  {invoice.invoiceData.rfc}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(invoice.invoiceData.rfc, `rfc-${invoice.id}`)
                }
                className="p-1 rounded-md"
              >
                {copiedId === `rfc-${invoice.id}` ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} className="text-muted-foreground" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* UUID */}
          {invoice.invoiceData.uuid && (
            <View className="flex-row justify-between items-center gap-2">
              <View className="flex-row items-center gap-2 flex-1">
                <Text className="text-xs text-muted-foreground shrink-0">UUID:</Text>
                <Text className="text-xs font-mono flex-1" numberOfLines={1}>
                  {invoice.invoiceData.uuid}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(invoice.invoiceData.uuid, `uuid-${invoice.id}`)
                }
                className="p-1 rounded-md"
              >
                {copiedId === `uuid-${invoice.id}` ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} className="text-muted-foreground" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Vendor (if no RFC) */}
          {invoice.invoiceData.vendor && !invoice.invoiceData.rfc && (
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-muted-foreground">Emisor:</Text>
              <Text className="text-xs text-foreground" numberOfLines={1}>
                {invoice.invoiceData.vendor}
              </Text>
            </View>
          )}

          {/* Scanned timestamp */}
          {invoice.invoiceData.scannedAt && (
            <Text className="text-[10px] text-muted-foreground/70 pt-1">
              Escaneado: {new Date(invoice.invoiceData.scannedAt).toLocaleString('es-MX')}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="bg-card rounded-2xl overflow-hidden border border-border"
    >
      <View className="p-5">
        <View className="flex-row items-center gap-2 mb-3">
          <Receipt size={20} className="text-primary" />
          <Text className="text-lg font-semibold text-foreground">
            Facturas Escaneadas
          </Text>
          <Text className="ml-auto text-sm font-normal text-muted-foreground">
            {invoicesToShow.length}{' '}
            {invoicesToShow.length === 1 ? 'factura' : 'facturas'}
          </Text>
        </View>

        <FlatList
          data={invoicesToShow.slice(0, 10)}
          keyExtractor={(item) => item.id}
          renderItem={renderInvoiceItem}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />

        {invoicesToShow.length > 10 && (
          <Text className="text-xs text-center text-muted-foreground pt-2">
            Mostrando las últimas 10 de {invoicesToShow.length} facturas
          </Text>
        )}
      </View>
    </LinearGradient>
  );
};

export default InvoiceHistory;