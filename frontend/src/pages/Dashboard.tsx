import { AddMonitorForm } from '../components/AddMonitorForm';
import { ErrorBanner } from '../components/ErrorBanner';
import { MonitorTable } from '../components/MonitorTable';
import { useMonitors } from '../hooks/useMonitors';

export function Dashboard() {
  const { monitors, isLoading, error, addMonitor } = useMonitors();
  const upCount = monitors.filter((m) => m.latest_check?.is_up).length;
  const downCount = monitors.filter((m) => m.latest_check && !m.latest_check.is_up).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Uptime Monitor</h1>
          <p className="mt-1 text-sm text-slate-400">
            Tracking {monitors.length} {monitors.length === 1 ? 'target' : 'targets'} · {upCount} up · {downCount} down
          </p>
        </header>
        <div className="mb-6"><AddMonitorForm onAdd={addMonitor} /></div>
        {error && <div className="mb-6"><ErrorBanner message={error} /></div>}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">Loading...</div>
        ) : (
          <MonitorTable monitors={monitors} />
        )}
      </div>
    </div>
  );
}