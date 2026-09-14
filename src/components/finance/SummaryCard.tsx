import { LucideProps } from 'lucide-react-native';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { View, Text } from 'react-native';

export default function SummaryCard({ icon, amount, title, color, subtitle, className }: { icon: ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>> | null; amount: number, title?: string, color?: string, subtitle?: string, className?: string }) {
  return (
    <View className={`bg-${color || 'primary'} rounded-2xl p-5 shadow-md ${className || ''}`}>
      {icon && icon({})}
      {<Text className="text-white/80 text-sm">{title || 'Resumen'}</Text>}
      {subtitle && <Text className="text-white/60 text-xs mt-1">{subtitle}</Text>}
      <Text className="text-white text-3xl font-bold mt-1">
        ${amount?.toLocaleString() ?? 0}
      </Text>
    </View>
  );
}