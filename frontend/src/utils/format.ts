export function formatTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function responseTimeColorClass(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return 'text-slate-400';
  if (ms < 100) return 'text-emerald-400';
  if (ms <= 300) return 'text-amber-400';
  return 'text-rose-400';
}

export function formatResponseTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  return `${ms.toFixed(2)} ms`;
}