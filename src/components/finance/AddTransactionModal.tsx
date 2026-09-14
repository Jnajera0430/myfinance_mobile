import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFinance, TransactionType, TransactionCategory } from '../../contexts/FinanceContext';
import { useFinance as useFinanceLocal } from '../../contexts/FinanceContext';
// import { useToast } from '/hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
}

const typeOptions: { value: TransactionType; label: string; color: string }[] = [
    { value: 'INCOME', label: '💰 Dinero que entra', color: 'text-income' },
    { value: 'FIXED_EXPENSE', label: '🏠 Gasto fijo', color: 'text-expense-fixed' },
    { value: 'VARIABLE_EXPENSE', label: '🛒 Gasto del día', color: 'text-expense-variable' },
];

const categoryOptions: Record<TransactionType, { value: TransactionCategory; label: string }[]> = {
    INCOME: [
        { value: 'salary', label: 'Sueldo Principal' },
        { value: 'bonus', label: 'Bonificaciones' },
        { value: 'extras', label: 'Ingresos Extras' },
        { value: 'other_income', label: 'Otros ingresos' },
    ],
    FIXED_EXPENSE: [
        { value: 'rent', label: 'Renta' },
        { value: 'utilities', label: 'Servicios (luz, agua, internet)' },
        { value: 'subscriptions', label: 'Suscripciones' },
        { value: 'insurance', label: 'Seguros' },
    ],
    VARIABLE_EXPENSE: [
        { value: 'food', label: 'Comida' },
        { value: 'transport', label: 'Transporte' },
        { value: 'entertainment', label: 'Entretenimiento' },
        { value: 'shopping', label: 'Compras' },
        { value: 'other_expense', label: 'Otros gastos' },
    ],
};

const AddTransactionModal = ({ visible, onClose }: AddTransactionModalProps) => {
    //   const { isDemo } = useAuth();
    const { addTransaction } = useFinance();
    const { addTransaction: addTransactionLocal } = useFinanceLocal();
    //   const { toast } = useToast();

    const [type, setType] = useState<TransactionType>('VARIABLE_EXPENSE');
    const [category, setCategory] = useState<TransactionCategory>('food');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        // Reset category to first option of new type
        setCategory(categoryOptions[newType][0].value);
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast({
                title: 'Error',
                description: 'Por favor ingresa un monto válido',
                variant: 'destructive',
                open: true,
                onOpenChange: () => { },
            });
            return;
        }

        const dateStr = date.toISOString().split('T')[0];
        const finalDescription = description.trim() || categoryOptions[type].find(c => c.value === category)?.label || '';

        // if (isDemo) {
        //     addTransactionLocal({
        //         type,
        //         category,
        //         amount: amountNum,
        //         description: finalDescription,
        //         date: dateStr,
        //         isRecurring: false,
        //     });
        // } else {
            addTransaction({
                type,
                category,
                amount: amountNum,
                description: finalDescription,
                date: dateStr,
                isRecurring: false,
            });
        // }

        toast({
            title: '¡Listo!',
            description: type === 'INCOME' ? 'Ingreso registrado' : 'Gasto registrado',
            variant: 'success',
            open: true,
        });

        // Reset form
        setAmount('');
        setDescription('');
        setDate(new Date());
        onClose();
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/50 justify-end">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            className="bg-card rounded-t-3xl border-t border-border"
                        >
                            <ScrollView className="p-5 max-h-[90%]" showsVerticalScrollIndicator={false}>
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-xl font-bold text-foreground">¿Qué quieres registrar? 📝</Text>
                                    <TouchableOpacity onPress={onClose} className="p-2">
                                        <Text className="text-muted-foreground text-lg">✕</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Transaction Type */}
                                <View className="space-y-2 mb-4">
                                    <Text className="text-sm font-medium text-foreground">Tipo de transacción</Text>
                                    <View className="flex-row gap-2">
                                        {typeOptions.map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                onPress={() => handleTypeChange(option.value)}
                                                className={cn(
                                                    'flex-1 px-3 py-2 rounded-lg items-center border border-border',
                                                    type === option.value
                                                        ? 'bg-primary/20 border-primary'
                                                        : 'bg-muted/30'
                                                )}
                                            >
                                                <Text
                                                    className={cn(
                                                        'text-sm font-medium',
                                                        type === option.value ? 'text-foreground' : 'text-muted-foreground'
                                                    )}
                                                >
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Category */}
                                <View className="space-y-2 mb-4">
                                    <Text className="text-sm font-medium text-foreground">Categoría</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowCategoryPicker(true)}
                                        className="border border-border rounded-lg px-4 py-3 bg-muted/30"
                                    >
                                        <Text className="text-foreground">
                                            {categoryOptions[type].find(c => c.value === category)?.label}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Amount */}
                                <View className="space-y-2 mb-4">
                                    <Text className="text-sm font-medium text-foreground">Monto</Text>
                                    <View className="relative flex-row items-center">
                                        <Text className="absolute left-3 text-muted-foreground">$</Text>
                                        <TextInput
                                            value={amount}
                                            onChangeText={setAmount}
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                            className="flex-1 border border-border rounded-lg px-8 py-3 text-foreground bg-muted/30"
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                </View>

                                {/* Description */}
                                <View className="space-y-2 mb-4">
                                    <Text className="text-sm font-medium text-foreground">Descripción (opcional)</Text>
                                    <TextInput
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholder="Ej: Supermercado semanal"
                                        maxLength={100}
                                        className="border border-border rounded-lg px-4 py-3 text-foreground bg-muted/30"
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>

                                {/* Date */}
                                <View className="space-y-2 mb-6">
                                    <Text className="text-sm font-medium text-foreground">Fecha</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowDatePicker(true)}
                                        className="border border-border rounded-lg px-4 py-3 bg-muted/30"
                                    >
                                        <Text className="text-foreground">{formatDate(date)}</Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            onChange={onDateChange}
                                        />
                                    )}
                                </View>

                                {/* Actions */}
                                <View className="flex-row gap-3 pt-2 pb-6">
                                    <TouchableOpacity
                                        onPress={onClose}
                                        className="flex-1 py-3 rounded-lg border border-border items-center"
                                    >
                                        <Text className="text-foreground font-medium">Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleSubmit}
                                        className="flex-1 py-3 rounded-lg bg-primary items-center"
                                    >
                                        <Text className="text-primary-foreground font-medium">Guardar</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>

            {/* Category Picker Modal */}
            <Modal
                visible={showCategoryPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryPicker(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowCategoryPicker(false)}>
                    <View className="flex-1 bg-black/50 justify-end">
                        <TouchableWithoutFeedback>
                            <View className="bg-card rounded-t-3xl p-5">
                                <Text className="text-lg font-bold text-foreground mb-4">Selecciona categoría</Text>
                                <ScrollView className="max-h-96">
                                    {categoryOptions[type].map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => {
                                                setCategory(option.value);
                                                setShowCategoryPicker(false);
                                            }}
                                            className="py-3 border-b border-border"
                                        >
                                            <Text className="text-foreground text-base">{option.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity
                                    onPress={() => setShowCategoryPicker(false)}
                                    className="mt-4 py-3 rounded-lg bg-muted items-center"
                                >
                                    <Text className="text-foreground font-medium">Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Modal>
    );
};

export default AddTransactionModal;