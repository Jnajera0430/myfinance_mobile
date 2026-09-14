import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {children}
    </SafeAreaView>
  );
}