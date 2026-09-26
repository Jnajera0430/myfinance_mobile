import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

const MOBILE_BREAKPOINT = 768;

/** Equivalente nativo al matchMedia de web: usa el tamano real de ventana. */
export function useIsMobile() {
  const [{ width, height }, setSize] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setSize({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  return width < MOBILE_BREAKPOINT;
}

export function useWindowDimensions() {
  const [size, setSize] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => setSize(window));
    return () => subscription?.remove();
  }, []);

  return size;
}
