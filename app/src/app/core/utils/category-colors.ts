const CATEGORY_COLORS: Record<string, string> = {
  pessoa: '#2563eb',
  capacete: '#16a34a',
  sem_capacete: '#dc2626',
  colete: '#f59e0b',
};

const FALLBACK_COLOR = '#6b7280';

export function getCategoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? FALLBACK_COLOR;
}