import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  style?: ViewStyle;
}

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  ghost: 'bg-transparent',
  danger: 'bg-destructive',
  success: 'bg-income',
  outline: 'bg-transparent border border-border',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-secondary-foreground',
  ghost: 'text-primary',
  danger: 'text-white',
  success: 'text-white',
  outline: 'text-foreground',
};

const PADDING: Record<Size, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
};

const FONT: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  className,
  style,
}: ButtonProps) {
  const inactive = disabled || loading;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.8}
      style={[{ opacity: inactive ? 0.55 : 1 }, style]}
      className={cn(
        'flex-row items-center justify-center rounded-2xl',
        CONTAINER[variant],
        PADDING[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost' || variant === 'outline' ? '#6366f1' : '#ffffff'}
        />
      ) : (
        icon
      )}
      <Text className={cn('font-semibold', LABEL[variant], FONT[size], loading && 'ml-2')}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default Button;
