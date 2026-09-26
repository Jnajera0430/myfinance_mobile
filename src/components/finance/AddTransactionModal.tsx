import TransactionForm from './TransactionForm';
import type { Transaction, TransactionType } from '../../graphql/types';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  editing?: Transaction | null;
  defaultType?: TransactionType;
}

/** Punto de entrada historico: ahora reutiliza TransactionForm (crear y editar). */
export default function AddTransactionModal({
  visible,
  onClose,
  editing,
  defaultType,
}: AddTransactionModalProps) {
  return (
    <TransactionForm visible={visible} onClose={onClose} editing={editing} defaultType={defaultType} />
  );
}
