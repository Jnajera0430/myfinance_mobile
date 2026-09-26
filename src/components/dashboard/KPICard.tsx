import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { cn } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  goodWhenUp?: boolean;
  className?: string;
}

const KPICard = ({
  title,
  value,
  change,
  changeLabel = 'vs mes anterior',
  icon,
  trend = 'neutral',
  goodWhenUp = true,
  className,
}: KPICardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const positive = goodWhenUp ? (change ?? 0) >= 0 : (change ?? 0) <= 0;
  const color = change === undefined ? '#64748b' : positive ? '#22c55e' : '#ef4444';

  return (
    <View className={cn('rounded-3xl border border-border bg-card p-5', className)}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <Text className="text-sm text-muted-foreground mb-1" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-2xl font-bold text-foreground" numberOfLines={1}>
            {value}
          </Text>

          {change !== undefined && (
            <View className="flex-row items-center mt-2">
              <TrendIcon size={15} color={color} />
              <Text className="text-sm font-semibold ml-1" style={{ color }}>
                {change > 0 ? '+' : ''}
                {Math.round(change)}%
              </Text>
              <Text className="text-xs text-muted-foreground ml-1.5" numberOfLines={1}>
                {changeLabel}
              </Text>
            </View>
          )}
        </View>

        {icon && <View className="w-11 h-11 rounded-2xl bg-primary/10 items-center justify-center">{icon}</View>}
      </View>
    </View>
  );
};

export default KPICard;
