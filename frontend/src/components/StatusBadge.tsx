interface StatusBadgeProps {
  isUp: boolean | null;
}

export function StatusBadge({ isUp }: StatusBadgeProps) {
  if (isUp === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700/60 px-2.5 py-1 text-xs font-medium text-slate-300">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        Pending
      </span>
    );
  }
  if (isUp) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
        🟢 UP
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400">
      🔴 DOWN
    </span>
  );
}