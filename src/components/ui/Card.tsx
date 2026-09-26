import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, className, style }: CardProps) {
  return (
    <View style={style} className={cn('rounded-3xl border border-border bg-card p-5', className)}>
      {children}
    </View>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
  icon,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center gap-2 flex-1 min-w-0">
        {icon}
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
            {title}
          </Text>
          {!!subtitle && (
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right}
    </View>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <View className={cn('', className)}>{children}</View>;
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Text className={cn('text-lg font-bold text-foreground mb-3', className)}>{children}</Text>
  );
}

export function EmptyState({
  emoji = '📭',
  title,
  description,
  action,
}: {
  emoji?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <View className="items-center py-8 px-4">
      <Text className="text-4xl mb-3">{emoji}</Text>
      <Text className="text-base font-semibold text-foreground text-center">{title}</Text>
      {!!description && (
        <Text className="text-sm text-muted-foreground text-center mt-1">{description}</Text>
      )}
      {!!action && <View className="mt-4 w-full max-w-xs">{action}</View>}
    </View>
  );
}

export default Card;
