import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface PrivacyContextType {
  isIncognito: boolean;
  toggleIncognito: () => void;
  formatAmount: (amount: number, forceShow?: boolean) => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const STORAGE_KEY = 'privacy_incognito';

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isIncognito, setIsIncognito] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isIncognito.toString());
    
    // Toggle class on body for CSS-based hiding
    if (isIncognito) {
      document.body.classList.add('incognito');
    } else {
      document.body.classList.remove('incognito');
    }
  }, [isIncognito]);

  const toggleIncognito = useCallback(() => {
    setIsIncognito(prev => !prev);
  }, []);

  const formatAmount = useCallback((amount: number, forceShow = false) => {
    if (isIncognito && !forceShow) {
      return '$ ****';
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  }, [isIncognito]);

  return (
    <PrivacyContext.Provider value={{ isIncognito, toggleIncognito, formatAmount }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
