import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Receipt, FileText, Copy, Check } from 'lucide-react-native';
import { useFinance } from '../../contexts/FinanceContext.graphql';
import { formatDateTime } from '../../lib/format';
import { EmptyState } from '../ui/Card';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { toast } from '../../hooks/use-toast';

const InvoiceHistory = () => {
  const { scannedInvoices } = useFinance();
  const { formatAmount } = usePrivacy();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = (text: string | null | undefined, key: string) => {
    if (!text) return;
    Clipboard.setString(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    toast({ title: 'Copiado al portapapeles' });
  };

  const invoices = scannedInvoices.slice(0, 5);

  return (
    <View className="rounded-3xl border border-border bg-card p-5">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Receipt size={18} color="#6366f1" />
          <Text className="text-base font-semibold text-foreground">Facturas escaneadas</Text>
        </View>
        {scannedInvoices.length > 0 && (
          <Text className="text-xs text-muted-foreground">
            {scannedInvoices.length}
          </Text>
        )}
      </View>

      {invoices.length === 0 ? (
        <EmptyState
          emoji="📸"
          title="Aún no escaneas ninguna factura"
          description="Toca el botón de escaneo para capturar el QR de una factura y registrar el gasto."
        />
      ) : (
        invoices.map((invoice) => (
          <View key={invoice.id} className="rounded-2xl border border-border p-4 mb-2">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                  {invoice.description}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  {invoice.invoiceData?.vendor || 'Proveedor sin nombre'}
                </Text>
              </View>
              <Text className="text-base font-bold text-foreground">
                {formatAmount(Number(invoice.amount))}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3 mt-3 pt-3 border-t border-border">
              {!!invoice.invoiceData?.rfc && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => copy(invoice.invoiceData?.rfc, `rfc-${invoice.id}`)}
                  className="flex-row items-center gap-1.5"
                >
                  <Text className="text-xs text-muted-foreground">RFC</Text>
                  <Text className="text-xs font-mono text-foreground" numberOfLines={1}>
                    {invoice.invoiceData.rfc.slice(0, 12)}
                  </Text>
                  {copiedKey === `rfc-${invoice.id}` ? (
                    <Check size={13} color="#22c55e" />
                  ) : (
                    <Copy size={13} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              )}

              {!!invoice.invoiceData?.uuid && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => copy(invoice.invoiceData?.uuid, `uuid-${invoice.id}`)}
                  className="flex-row items-center gap-1.5"
                >
                  <Text className="text-xs text-muted-foreground">UUID</Text>
                  <Text className="text-xs font-mono text-foreground" numberOfLines={1}>
                    {invoice.invoiceData.uuid.slice(0, 8)}…
                  </Text>
                  {copiedKey === `uuid-${invoice.id}` ? (
                    <Check size={13} color="#22c55e" />
                  ) : (
                    <Copy size={13} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              )}

              {!!invoice.invoiceData?.scannedAt && (
                <Text className="text-[10px] text-muted-foreground">
                  Escaneada {formatDateTime(invoice.invoiceData.scannedAt)}
                </Text>
              )}
            </View>
          </View>
        ))
      )}

      {scannedInvoices.length > 5 && (
        <Text className="text-xs text-center text-muted-foreground mt-1">
          Mostrando las últimas 5 de {scannedInvoices.length} facturas
        </Text>
      )}

      {invoices.length === 0 && scannedInvoices.length === 0 && (
        <View className="flex-row items-center justify-center gap-2 mt-1">
          <FileText size={14} color="#94a3b8" />
          <Text className="text-xs text-muted-foreground">
            Compatible con QR de facturas CFDI y comprobantes locales
          </Text>
        </View>
      )}
    </View>
  );
};

export default InvoiceHistory;
