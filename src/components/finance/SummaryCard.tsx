import { View, Text } from 'react-native';
import type { ComponentType } from 'react';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { cn } from '../../lib/utils';

type Tone = 'income' | 'fixed' | 'variable' | 'primary';

const TONE_BG: Record<Tone, string> = {
  income: 'bg-income/10',
  fixed: 'bg-expense-fixed/10',
  variable: 'bg-expense-variable/10',
  primary: 'bg-primary/10',
};

const TONE_TEXT: Record<Tone, string> = {
  income: 'text-income',
  fixed: 'text-expense-fixed',
  variable: 'text-expense-variable',
  primary: 'text-primary',
};

const TONE_ICON_BG: Record<Tone, string> = {
  income: 'bg-income/15',
  fixed: 'bg-expense-fixed/15',
  variable: 'bg-expense-variable/15',
  primary: 'bg-primary/15',
};

/** Los iconos SVG no aceptan className: se les pasa el color directo. */
const TONE_HEX: Record<Tone, string> = {
  income: '#22c55e',
  fixed: '#ef4444',
  variable: '#f59e0b',
  primary: '#6366f1',
};

interface SummaryCardProps {
  title: string;
  amount: number;
  icon?: ComponentType<{ size?: number; color?: string }>;
  tone?: Tone;
  subtitle?: string;
  className?: string;
}

export default function SummaryCard({
  title,
  amount,
  icon: Icon,
  tone = 'primary',
  subtitle,
  className,
}: SummaryCardProps) {
  const { formatAmount } = usePrivacy();

  return (
    <View className={cn('rounded-3xl border border-border p-4', TONE_BG[tone], className)}>
      {!!Icon && (
        <View className={cn('w-9 h-9 rounded-2xl items-center justify-center mb-3', TONE_ICON_BG[tone])}>
          <Icon size={18} color={TONE_HEX[tone]} />
        </View>
      )}

      <Text className="text-xs font-medium text-muted-foreground" numberOfLines={1}>
        {title}
      </Text>

      <Text className={cn('text-lg font-bold mt-1', TONE_TEXT[tone])} numberOfLines={1}>
        {formatAmount(amount)}
      </Text>

      {!!subtitle && (
        <Text className="text-[11px] text-muted-foreground mt-1" numberOfLines={2}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
