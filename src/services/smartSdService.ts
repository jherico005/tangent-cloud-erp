import { ServiceRequest } from '../types';

export interface SmartSdAuthResponse {
  success: boolean;
  token?: string;
  source?: string;
  user?: {
    username: string;
    role: string;
    teamName: string;
    area: string;
    system: string;
  };
  expiresAt?: string;
  error?: string;
  message?: string;
}

export interface SmartSdSyncResponse {
  success: boolean;
  source?: string;
  syncedCount?: number;
  syncedAt?: string;
  teamLeader?: string;
  requests?: ServiceRequest[];
  error?: string;
  message?: string;
}

export interface SmartSdSyncOptions {
  accountFilter?: string;
  categoryFilter?: string;
}

/**
 * SMART SD (Strateq Service Desk) Integration Service
 * Handles Team Leader authentication & Service Order data synchronization
 */
export const smartSdService = {
  /**
   * Authenticate Team Leader account against SMART SD API Backend
   */
  async login(username?: string, password?: string, baseUrl?: string): Promise<SmartSdAuthResponse> {
    try {
      const response = await fetch('/api/smart-sd/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, baseUrl })
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Authentication failed'
        };
      }

      return data as SmartSdAuthResponse;
    } catch (err: any) {
      console.error('SMART SD Login Error:', err);
      return {
        success: false,
        error: 'Unable to connect to SMART SD Authentication Gateway'
      };
    }
  },

  /**
   * Fetch active Service Orders from SMART SD and transform to Tangent Dispatcher Logs structure
   */
  async syncServiceOrders(
    token: string,
    username: string,
    options?: SmartSdSyncOptions
  ): Promise<SmartSdSyncResponse> {
    try {
      const response = await fetch('/api/smart-sd/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          username,
          accountFilter: options?.accountFilter || 'ALL'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Sync failed'
        };
      }

      return data as SmartSdSyncResponse;
    } catch (err: any) {
      console.error('SMART SD Sync Error:', err);
      return {
        success: false,
        error: 'Unable to fetch Service Orders from SMART SD Strateq API'
      };
    }
  }
};
