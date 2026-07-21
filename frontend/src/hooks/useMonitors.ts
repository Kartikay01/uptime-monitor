import { useCallback, useEffect, useRef, useState } from 'react';
import { monitorService } from '../services/monitorService';
import type { CreateMonitorPayload, Monitor } from '../types/monitor';

const POLL_INTERVAL_MS = 5000;

interface UseMonitorsResult {
  monitors: Monitor[];
  isLoading: boolean;
  error: string | null;
  addMonitor: (payload: CreateMonitorPayload) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMonitors(): UseMonitorsResult {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  const fetchMonitors = useCallback(async () => {
    try {
      const data = await monitorService.getAll();
      setMonitors(data);
      setError(null);
    } catch (err) {
      setError('Unable to reach the monitoring API. Is the backend running on http://localhost:8000?');
    } finally {
      if (isFirstLoad.current) {
        setIsLoading(false);
        isFirstLoad.current = false;
      }
    }
  }, []);

  const addMonitor = useCallback(
    async (payload: CreateMonitorPayload) => {
      await monitorService.create(payload);
      await fetchMonitors();
    },
    [fetchMonitors]
  );

  useEffect(() => {
    fetchMonitors();
    const intervalId = setInterval(fetchMonitors, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchMonitors]);

  return { monitors, isLoading, error, addMonitor, refresh: fetchMonitors };
}