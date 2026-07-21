import { StatusBadge } from './StatusBadge';
import type { Monitor } from '../types/monitor';
import { formatResponseTime, formatTimestamp, responseTimeColorClass } from '../utils/format';

interface MonitorRowProps {
  monitor: Monitor;
}

export function MonitorRow({ monitor }: MonitorRowProps) {
  const check = monitor.latest_check;
  return (
    <tr className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors">
      <td className="px-4 py-3 font-medium text-slate-100">{monitor.label}</td>
      <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
        <a href={monitor.url} target="_blank" rel="noreferrer" className="hover:text-sky-400 hover:underline" title={monitor.url}>
          {monitor.url}
        </a>
      </td>
      <td className="px-4 py-3"><StatusBadge isUp={check ? check.is_up : null} /></td>
      <td className="px-4 py-3 text-slate-300">{check?.status_code ?? '—'}</td>
      <td className={`px-4 py-3 font-mono text-sm ${responseTimeColorClass(check?.response_time_ms)}`}>
        {formatResponseTime(check?.response_time_ms)}
      </td>
      <td className="px-4 py-3 text-slate-400 text-sm whitespace-nowrap">
        {formatTimestamp(check?.checked_at)}
      </td>
    </tr>
  );
}