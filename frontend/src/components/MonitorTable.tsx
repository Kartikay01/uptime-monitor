import { MonitorRow } from './MonitorRow';
import type { Monitor } from '../types/monitor';

interface MonitorTableProps {
  monitors: Monitor[];
}

const HEADERS = ['Label', 'URL', 'Status', 'HTTP Status', 'Response Time', 'Last Checked'];

export function MonitorTable({ monitors }: MonitorTableProps) {
  if (monitors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 py-16 text-center">
        <p className="text-slate-400">No monitors yet.</p>
        <p className="mt-1 text-sm text-slate-500">Add a URL above to start tracking uptime.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/40">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80">
            {HEADERS.map((header) => (
              <th key={header} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {monitors.map((monitor) => <MonitorRow key={monitor.id} monitor={monitor} />)}
        </tbody>
      </table>
    </div>
  );
}