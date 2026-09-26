import React from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'income' | 'expenseFixed' | 'expenseVariable' | 'warning' | 'muted' | 'primary';

const CONTAINER: Record<BadgeVariant, string> = {
  default: 'bg-secondary',
  income: 'bg-income/15',
  expenseFixed: 'bg-expense-fixed/15',
  expenseVariable: 'bg-expense-variable/15',
  warning: 'bg-destructive/15',
  muted: 'bg-muted',
  primary: 'bg-primary/15',
};

const TEXT: Record<BadgeVariant, string> = {
  default: 'text-secondary-foreground',
  income: 'text-income',
  expenseFixed: 'text-expense-fixed',
  expenseVariable: 'text-expense-variable',
  warning: 'text-destructive',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <View className={cn('self-start rounded-full px-2.5 py-1', CONTAINER[variant], className)}>
      <Text className={cn('text-xs font-semibold', TEXT[variant])}>{children}</Text>
    </View>
  );
}

export default Badge;
