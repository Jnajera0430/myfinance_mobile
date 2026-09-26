import MovementsScreen from './MovementsScreen';

/** Gastos obligatorios y periodicos: arriendo, servicios, suscripciones, seguros. */
export default function FixedExpensesScreen() {
  return <MovementsScreen initialSegment="FIXED_EXPENSE" />;
}
