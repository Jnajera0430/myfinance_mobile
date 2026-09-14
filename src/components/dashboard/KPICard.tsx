// src/components/finance/KPICard.tsx
import { View, Text } from 'react-native';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { LinearGradient } from 'expo-linear-gradient';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const KPICard = ({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  trend = 'neutral',
  className,
}: KPICardProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={cn(
        'rounded-2xl overflow-hidden border border-border bg-card',
        className
      )}
    >
      <View className="p-5">
        <View className="flex-row justify-between items-start">
          {/* Left side: title, value, change */}
          <View className="flex-1 mr-3">
            <Text className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </Text>
            <Text className="text-3xl font-bold text-foreground tracking-tight">
              {value}
            </Text>
            {change !== undefined && (
              <View className="flex-row items-center mt-2">
                {TrendIcon && (
                  <TrendIcon
                    size={16}
                    className={cn(
                      trend === 'up' && 'text-success',
                      trend === 'down' && 'text-destructive'
                    )}
                  />
                )}
                <Text
                  className={cn(
                    'text-sm font-medium ml-1',
                    trend === 'up' && 'text-success',
                    trend === 'down' && 'text-destructive',
                    trend === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {change > 0 ? '+' : ''}{change}%
                </Text>
                <Text className="text-sm text-muted-foreground ml-1">
                  {changeLabel}
                </Text>
              </View>
            )}
          </View>

          {/* Right side: icon */}
          <View className="p-3 rounded-xl bg-primary/10">
            <Icon size={24} className="text-primary" />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default KPICard;