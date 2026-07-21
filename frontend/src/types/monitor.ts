export interface LatestCheck {
  id: number;
  status_code: number | null;
  response_time_ms: number | null;
  is_up: boolean;
  checked_at: string;
}

export interface Monitor {
  id: number;
  url: string;
  label: string;
  created_at: string;
  latest_check: LatestCheck | null;
}

export interface CreateMonitorPayload {
  url: string;
  label: string;
}