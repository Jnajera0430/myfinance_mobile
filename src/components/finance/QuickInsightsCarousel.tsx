// src/components/finance/QuickAddButton.tsx
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
//   TouchableWithoutFeedback,
} from 'react-native';
import { Plus, Camera, PenLine } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '../../lib/utils';

interface QuickAddButtonProps {
  onClick?: () => void;
  onScanClick?: () => void;
  className?: string;
}

const QuickAddButton = ({ onClick, onScanClick, className }: QuickAddButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const handleMainPress = () => {
    setIsExpanded(!isExpanded);
  };

  const handleManualPress = () => {
    setIsExpanded(false);
    onClick?.();
  };

  const handleScanPress = () => {
    setIsExpanded(false);
    onScanClick?.();
  };

  // Animations
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const opacity = animatedValue;

  return (
    <View className={cn('absolute bottom-6 right-4 z-50', className)}>
      {/* Expanded options */}
      <>
        {/* Scan option */}
        <Animated.View
          style={{
            opacity,
            transform: [{ translateY }],
          }}
          className="absolute bottom-16 right-0 mb-2"
        >
          <View className="flex-row items-center gap-2">
            <View className="px-3 py-1.5 rounded-full bg-white shadow-lg">
              <Text className="text-sm font-medium text-gray-800">
                Escanear ticket <Camera size={16} color="#1f2937" />
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleScanPress}
              activeOpacity={0.7}
              className="w-12 h-12 rounded-full bg-white shadow-lg items-center justify-center"
            >
              <Camera size={20} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Manual option */}
        <Animated.View
          style={{
            opacity,
            transform: [{ translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [40, 0],
            }) }],
          }}
          className="absolute bottom-28 right-0"
        >
          <View className="flex-row items-center gap-2">
            <View className="px-3 py-1.5 rounded-full bg-white shadow-lg">
              <Text className="text-sm font-medium text-gray-800">
                Agregar manual <PenLine size={16} color="#1f2937" />
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleManualPress}
              activeOpacity={0.7}
              className="w-12 h-12 rounded-full bg-white shadow-lg items-center justify-center"
            >
              <PenLine size={20} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </>

      {/* Main FAB button */}
      <TouchableOpacity
        onPress={handleMainPress}
        activeOpacity={0.8}
        className="w-14 h-14 rounded-full shadow-lg shadow-income/30"
      >
        <LinearGradient
          colors={['#22c55e', '#3b82f6']} // from-income to-primary
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="w-full h-full rounded-full items-center justify-center"
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <Plus size={28} color="white" />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default QuickAddButton;