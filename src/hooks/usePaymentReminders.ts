import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext.graphql';
import { toast } from '@/hooks/use-toast';
import { readFlag, writeFlag } from '@/lib/auth-storage';
import { formatAmount } from '@/lib/format';
import { useSettings } from '@/contexts/SettingsContext';

interface Reminder {
  id: string;
  transactionId: string;
  description: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}

export function getReminderMessage(daysUntilDue: number, description: string): string {
  if (daysUntilDue === 0) return `¡Hoy vence ${description}! No lo olvides 💪`;
  if (daysUntilDue === 1) return `¡Mañana vence ${description}! ¿Ya lo tienes listo?`;
  return `${description} vence en ${daysUntilDue} días. ¡Tranquilo, hay tiempo!`;
}

/**
 * Calcula los gastos fijos que vencen en los proximos 3 dias y
 * muestra avisos amables una sola vez por dia.
 */
export function usePaymentReminders() {
  const { transactions } = useFinance();
  const { currency, language } = useSettings();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const checkReminders = useCallback((): Reminder[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: Reminder[] = [];

    for (const expense of transactions) {
      if (expense.type !== 'FIXED_EXPENSE') continue;

      const expenseDate = new Date(`${expense.date}T00:00:00`);
      if (Number.isNaN(expenseDate.getTime())) continue;

      const dayOfMonth = expenseDate.getDate();
      const nextDue = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
      if (nextDue.getTime() < today.getTime()) {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }

      const diffDays = Math.ceil((nextDue.getTime() - today.getTime()) / 86_400_000);

      if (diffDays >= 0 && diffDays <= 3) {
        upcoming.push({
          id: `reminder-${expense.id}`,
          transactionId: expense.id,
          description: expense.description,
          amount: Number(expense.amount),
          dueDate: nextDue.toISOString().slice(0, 10),
          daysUntilDue: diffDays,
        });
      }
    }

    upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    setReminders(upcoming);
    return upcoming;
  }, [transactions]);

  const showReminderNotifications = useCallback(async () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `reminders_shown_${todayKey}`;

    if (await readFlag(storageKey)) return;

    const upcoming = checkReminders();

    upcoming.forEach((reminder, index) => {
      setTimeout(() => {
        toast({
          title: reminder.daysUntilDue === 0 ? '⚠️ Pago pendiente hoy' : '🔔 Recordatorio',
          description: getReminderMessage(reminder.daysUntilDue, reminder.description),
          duration: 6000,
        });
      }, index * 2000);
    });

    if (upcoming.length > 0) {
      await writeFlag(storageKey, true);
    }
  }, [checkReminders]);

  useEffect(() => {
    if (transactions.length === 0) {
      setReminders([]);
      return;
    }
    checkReminders();
  }, [checkReminders, transactions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void showReminderNotifications();
    }, 2500);

    return () => clearTimeout(timer);
  }, [showReminderNotifications]);

  const summaryText = useMemo(() => {
    if (reminders.length === 0) return null;
    const total = reminders.reduce((sum, item) => sum + item.amount, 0);
    return `${reminders.length} pago(s) próximo(s) · ${formatAmount(total, currency, language)}`;
  }, [reminders, currency, language]);

  return { reminders, checkReminders, showReminderNotifications, summaryText };
}
