import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/hooks/use-toast';
import type { ToastActionElement, ToastProps } from './toastTypes';
import { cn } from '@/lib/utils';

export type { ToastActionElement, ToastProps };

const VARIANT_STYLE: Record<string, string> = {
  default: 'bg-foreground',
  destructive: 'bg-destructive',
  success: 'bg-income',
};

/**
 * Host de notificaciones. Debe montarse una sola vez en App.tsx.
 * Sustituye al Toaster de shadcn/radix, que no funciona en React Native.
 */
export function Toaster() {
  const { toasts } = useToast();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = React.useState<Record<string, boolean>>({});
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timers = toasts.map((item) => {
      const id = item.id;
      const duration = item.duration ?? 4000;

      const timeout = setTimeout(() => {
        setVisible((prev) => ({ ...prev, [id]: false }));
        item.onOpenChange?.(false);
      }, duration);

      return timeout;
    });

    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: toasts.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [toasts.length, opacity]);

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        top: insets.top + 12,
        zIndex: 9999,
      }}
    >
      {toasts.map((item) => (
        <Animated.View
          key={item.id}
          pointerEvents="box-none"
          style={{ opacity }}
          className={cn(
            'mb-2 rounded-2xl px-4 py-3 shadow-lg',
            VARIANT_STYLE[item.variant ?? 'default'] ?? VARIANT_STYLE.default,
          )}
        >
          <Text className="text-white font-semibold text-base" numberOfLines={2}>
            {String(item.title ?? '')}
          </Text>
          {!!item.description && (
            <Text className="text-white/85 text-sm mt-0.5" numberOfLines={3}>
              {String(item.description)}
            </Text>
          )}
        </Animated.View>
      ))}
    </View>
  );
}

export default Toaster;
