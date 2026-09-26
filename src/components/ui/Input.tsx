import React from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  containerClassName,
  className,
  prefix,
  suffix,
  ...inputProps
}: InputProps) {
  const field = (
    <View
      className={cn(
        'flex-row items-center rounded-2xl border px-4 bg-white',
        error ? 'border-destructive' : 'border-border',
        className,
      )}
    >
      {prefix}
      <TextInput
        placeholderTextColor="#94a3b8"
        {...inputProps}
        className={cn('flex-1 py-3 text-base text-foreground', !!prefix && 'ml-2', !!suffix && 'mr-2')}
      />
      {suffix}
    </View>
  );

  if (!label && !error && !hint) return field;

  return (
    <View className={containerClassName}>
      {!!label && <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>}
      {field}
      {!!error && <Text className="text-xs text-destructive mt-1.5">{error}</Text>}
      {!error && !!hint && <Text className="text-xs text-muted-foreground mt-1.5">{hint}</Text>}
    </View>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Selector simple sin dependencias web (radix/select). */
export function Select({ label, value, options, onChange, placeholder = 'Selecciona' }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View>
      {!!label && <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>}
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => setOpen((prev) => !prev)}
        className="flex-row items-center justify-between rounded-2xl border border-border bg-white px-4 py-3"
      >
        <Text className={cn('text-base', selected ? 'text-foreground' : 'text-muted-foreground')}>
          {selected?.label ?? placeholder}
        </Text>
        <Text className="text-muted-foreground">{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {open && (
        <View className="mt-1 rounded-2xl border border-border bg-white overflow-hidden">
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                'px-4 py-3 flex-row items-center justify-between',
                index > 0 && 'border-t border-border',
                option.value === value && 'bg-secondary',
              )}
            >
              <Text className="text-base text-foreground">{option.label}</Text>
              {option.value === value && <Text className="text-primary">✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default Input;
