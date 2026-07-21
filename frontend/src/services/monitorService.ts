import { apiClient } from './apiClient';
import type { CreateMonitorPayload, Monitor } from '../types/monitor';

export const monitorService = {
  async getAll(): Promise<Monitor[]> {
    const response = await apiClient.get<Monitor[]>('/urls');
    return response.data;
  },
  async create(payload: CreateMonitorPayload): Promise<Monitor> {
    const response = await apiClient.post<Monitor>('/urls', payload);
    return response.data;
  },
};