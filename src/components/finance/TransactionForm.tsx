import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFinance, Transaction } from '../../contexts/FinanceContext.graphql';
import { getCategoriesByType, getCategoryLabel } from '../../lib/categories';
import { formatAmount, getCurrencyInfo, toISODate, todayISO } from '../../lib/format';
import { parseAmount } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import { useSettings } from '../../contexts/SettingsContext';
import type { RecurrencePeriod, TransactionType } from '../../graphql/types';

interface TransactionFormProps {
  visible: boolean;
  onClose: () => void;
  /** Si viene, edita; si no, crea. */
  editing?: Transaction | null;
  defaultType?: TransactionType;
}

const TYPE_OPTIONS: { value: TransactionType; label: string; activeClass: string }[] = [
  { value: 'INCOME', label: 'Ingreso', activeClass: 'bg-income/15 border-income' },
  { value: 'FIXED_EXPENSE', label: 'Gasto fijo', activeClass: 'bg-expense-fixed/15 border-expense-fixed' },
  { value: 'VARIABLE_EXPENSE', label: 'Gasto variable', activeClass: 'bg-expense-variable/15 border-expense-variable' },
];

const PERIODS: { value: RecurrencePeriod; label: string }[] = [
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'BIWEEKLY', label: 'Quincenal' },
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'YEARLY', label: 'Anual' },
];

export default function TransactionForm({ visible, onClose, editing, defaultType }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useFinance();
  const { currency, language } = useSettings();

  const [type, setType] = useState<TransactionType>(editing?.type ?? defaultType ?? 'VARIABLE_EXPENSE');
  const [category, setCategory] = useState<string>(editing?.category ?? '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [date, setDate] = useState<Date>(new Date(editing?.date ?? todayISO()));
  const [isRecurring, setIsRecurring] = useState(editing?.isRecurring ?? false);
  const [recurrencePeriod, setRecurrencePeriod] = useState<RecurrencePeriod>(
    editing?.recurrencePeriod ?? 'MONTHLY',
  );
  const [isPaid, setIsPaid] = useState(editing?.isPaid ?? true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const categories = useMemo(() => getCategoriesByType(type), [type]);

  // Reinicia el formulario cada vez que se abre
  useEffect(() => {
    if (!visible) return;
    setType(editing?.type ?? defaultType ?? 'VARIABLE_EXPENSE');
    setCategory(editing?.category ?? (defaultType ? getCategoriesByType(defaultType)[0]?.value : '') ?? '');
    setAmount(editing ? String(editing.amount) : '');
    setDescription(editing?.description ?? '');
    setDate(new Date(editing?.date ?? todayISO()));
    setIsRecurring(editing?.isRecurring ?? false);
    setRecurrencePeriod(editing?.recurrencePeriod ?? 'MONTHLY');
    setIsPaid(editing?.isPaid ?? true);
    setFieldError('');
  }, [visible, editing, defaultType]);

  useEffect(() => {
    if (categories.length === 0) return;
    if (!categories.some((item) => item.value === category)) {
      setCategory(categories[0].value);
    }
  }, [categories, category]);

  const parsedAmount = parseAmount(amount);

  const handleTypeChange = (next: TransactionType) => {
    setType(next);
    const nextCategories = getCategoriesByType(next);
    if (!nextCategories.some((item) => item.value === category)) {
      setCategory(nextCategories[0]?.value ?? '');
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (selected) setDate(selected);
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setFieldError('');

    if (parsedAmount <= 0) {
      setFieldError('Ingresa un monto mayor que 0.');
      return;
    }

    if (!category) {
      setFieldError('Selecciona una categoría.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type,
        category,
        amount: parsedAmount,
        description: description.trim() || getCategoryLabel(category),
        date: toISODate(date),
        isRecurring,
        recurrencePeriod: isRecurring ? recurrencePeriod : 'MONTHLY' as RecurrencePeriod,
        isPaid,
      };

      if (editing) {
        await updateTransaction(editing.id, payload);
        toast({ title: 'Movimiento actualizado', variant: 'success' });
      } else {
        await addTransaction(payload);
        toast({
          title: type === 'INCOME' ? 'Ingreso registrado' : 'Gasto registrado',
          description: formatAmount(parsedAmount, currency, language),
          variant: 'success',
        });
      }

      onClose();
    } catch (error) {
      setFieldError('No se pudo guardar. Revisa tu conexión e inténtalo de nuevo.');
      if (__DEV__) console.error('TransactionForm save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="bg-card rounded-t-3xl border-t border-border"
        >
          <ScrollView
            className="max-h-[88%]"
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-foreground">
                {editing ? 'Editar movimiento' : '¿Qué quieres registrar?'}
              </Text>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" className="p-2 -mr-2">
                <Text className="text-muted-foreground text-xl">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-medium text-foreground mb-2">Tipo</Text>
            <View className="flex-row gap-2 mb-5">
              {TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleTypeChange(option.value)}
                  className={cn(
                    'flex-1 rounded-2xl border px-2 py-3 items-center',
                    type === option.value ? option.activeClass : 'border-border bg-muted/40',
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-semibold text-center',
                      type === option.value ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-medium text-foreground mb-2">Categoría</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              className="flex-row items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 mb-5"
            >
              <Text className="text-base text-foreground">{getCategoryLabel(category) || 'Selecciona'}</Text>
              <Text className="text-muted-foreground">▾</Text>
            </TouchableOpacity>

            <Text className="text-sm font-medium text-foreground mb-2">Monto</Text>
            <View className="flex-row items-center rounded-2xl border border-border bg-white px-4 mb-2">
              <Text className="text-muted-foreground text-lg mr-1">{getCurrencyInfo(currency).symbol}</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#94a3b8"
                className="flex-1 py-3 text-xl font-semibold text-foreground"
              />
            </View>
            {parsedAmount > 0 && (
              <Text className="text-xs text-muted-foreground mb-3">
                Se registrará como {formatAmount(parsedAmount, currency, language)}
              </Text>
            )}
            {parsedAmount <= 0 && <View className="mb-3" />}

            <Text className="text-sm font-medium text-foreground mb-2">Descripción</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ej: Supermercado semanal"
              maxLength={100}
              placeholderTextColor="#94a3b8"
              className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground mb-5"
            />

            <Text className="text-sm font-medium text-foreground mb-2">Fecha</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker((prev) => !prev)}
              className="rounded-2xl border border-border bg-white px-4 py-3 mb-3"
            >
              <Text className="text-base text-foreground">{toISODate(date)}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
                locale="es"
              />
            )}

            <View className="rounded-2xl border border-border bg-white px-4 py-3 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-medium text-foreground">Se repite</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    Marca si es un movimiento periódico
                  </Text>
                </View>
                <Switch value={isRecurring} onValueChange={setIsRecurring} trackColor={{ true: '#6366f1' }} />
              </View>

              {isRecurring && (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {PERIODS.map((period) => (
                    <TouchableOpacity
                      key={period.value}
                      onPress={() => setRecurrencePeriod(period.value)}
                      className={cn(
                        'rounded-full px-3 py-1.5 border',
                        recurrencePeriod === period.value
                          ? 'bg-primary/15 border-primary'
                          : 'bg-muted/40 border-border',
                      )}
                    >
                      <Text
                        className={cn(
                          'text-xs font-semibold',
                          recurrencePeriod === period.value ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {period.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View className="rounded-2xl border border-border bg-white px-4 py-3 mb-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-base font-medium text-foreground">Ya está pagado</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    Desmárcalo si aún debes pagarlo
                  </Text>
                </View>
                <Switch value={isPaid} onValueChange={setIsPaid} trackColor={{ true: '#6366f1' }} />
              </View>
            </View>

            {!!fieldError && (
              <View className="bg-destructive/10 border border-destructive/25 rounded-2xl px-4 py-3 mb-4">
                <Text className="text-destructive text-sm">{fieldError}</Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                disabled={saving}
                className="flex-1 rounded-2xl border border-border py-3.5 items-center"
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={saving}
                className="flex-1 rounded-2xl bg-primary py-3.5 items-center flex-row justify-center"
              >
                {saving && <ActivityIndicator color="#ffffff" className="mr-2" />}
                <Text className="text-white font-semibold">{editing ? 'Guardar' : 'Registrar'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-card rounded-t-3xl p-5">
            <Text className="text-lg font-bold text-foreground mb-3">Selecciona categoría</Text>
            <ScrollView className="max-h-96">
              {categories.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setCategory(option.value);
                    setShowCategoryPicker(false);
                  }}
                  className={cn(
                    'flex-row items-center justify-between py-3.5',
                    index > 0 && 'border-t border-border',
                  )}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: option.color }}
                    />
                    <Text className="text-base text-foreground">{option.label}</Text>
                  </View>
                  {option.value === category && <Text className="text-primary">✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(false)}
              className="mt-4 rounded-2xl bg-muted py-3 items-center"
            >
              <Text className="text-foreground font-semibold">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
