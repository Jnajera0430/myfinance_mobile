import { useEffect, useState, useCallback } from 'react';
import { useFinance } from '@/contexts/FinanceContext.graphql';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  transactionId: string;
  description: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
}

export function usePaymentReminders() {
  const { transactions } = useFinance();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [hasShownToday, setHasShownToday] = useState(false);

  const checkReminders = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fixedExpenses = transactions.filter(t => t.type === 'FIXED_EXPENSE');
    
    const upcomingReminders: Reminder[] = [];

    fixedExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const expenseDay = expenseDate.getDate();
      
      // Calculate next due date (same day this month or next month)
      const nextDue = new Date(today.getFullYear(), today.getMonth(), expenseDay);
      if (nextDue < today) {
        nextDue.setMonth(nextDue.getMonth() + 1);
      }

      const diffTime = nextDue.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Remind 3 days before, 1 day before, and on the day
      if (diffDays <= 3 && diffDays >= 0) {
        upcomingReminders.push({
          id: `reminder-${expense.id}`,
          transactionId: expense.id,
          description: expense.description,
          amount: expense.amount,
          dueDate: nextDue.toISOString().split('T')[0],
          daysUntilDue: diffDays,
        });
      }
    });

    setReminders(upcomingReminders);
    return upcomingReminders;
  }, [transactions]);

  const showReminderNotifications = useCallback(() => {
    const todayKey = new Date().toISOString().split('T')[0];
    const shownKey = `reminders_shown_${todayKey}`;
    
    if (localStorage.getItem(shownKey)) {
      return;
    }

    const upcomingReminders = checkReminders();
    
    upcomingReminders.forEach((reminder, index) => {
      setTimeout(() => {
        let message = '';
        if (reminder.daysUntilDue === 0) {
          message = `¡Hoy vence tu pago de ${reminder.description}!`;
        } else if (reminder.daysUntilDue === 1) {
          message = `¡Mañana vence tu pago de ${reminder.description}!`;
        } else {
          message = `Tu pago de ${reminder.description} vence en ${reminder.daysUntilDue} días`;
        }

        toast({
          title: reminder.daysUntilDue === 0 ? '⚠️ Pago pendiente hoy' : '🔔 Recordatorio amable',
          description: message,
          duration: 6000,
        });
      }, index * 2000); // Stagger notifications
    });

    if (upcomingReminders.length > 0) {
      localStorage.setItem(shownKey, 'true');
    }
  }, [checkReminders, toast]);

  useEffect(() => {
    checkReminders();
  }, [checkReminders]);

  useEffect(() => {
    // Show notifications on first load
    const timer = setTimeout(() => {
      if (!hasShownToday) {
        showReminderNotifications();
        setHasShownToday(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [showReminderNotifications, hasShownToday]);

  return {
    reminders,
    checkReminders,
    showReminderNotifications,
  };
}

export function getReminderMessage(daysUntilDue: number, description: string): string {
  if (daysUntilDue === 0) {
    return `¡Hoy vence ${description}! No olvides pagarlo 💪`;
  } else if (daysUntilDue === 1) {
    return `¡Mañana vence ${description}! ¿Ya lo tienes listo?`;
  } else {
    return `${description} vence en ${daysUntilDue} días. ¡Tranquilo, hay tiempo!`;
  }
}
