export type DeadlineState = 'default' | 'soon' | 'overdue';

/**
 * Определяет состояние дедлайна относительно сегодняшнего дня.
 * - 'overdue' — дедлайн в прошлом
 * - 'soon' — дедлайн сегодня или завтра
 * - 'default' — всё остальное
 */
export function getDeadlineState(
  deadline: string | null | undefined
): DeadlineState {
  if (!deadline) return 'default';

  const today = new Date().toLocaleDateString('sv-SE');
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toLocaleDateString('sv-SE');

  if (deadline < today) return 'overdue';
  if (deadline <= tomorrow) return 'soon';
  return 'default';
}

/**
 * Форматирует дату из YYYY-MM-DD в читаемый вид (например, "12 октября").
 */
export function formatDeadline(deadline: string | null): string {
  if (!deadline) return '';

  const date = new Date(deadline + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}