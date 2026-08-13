import { EFSRRecord, AppUser } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (typeof window !== 'undefined' ? '' : 'https://api.tangentsolutionsinc.com');

export interface AzureHealthResponse {
  status: string;
  azureDbConnected: boolean;
  serverTime: string;
  message?: string;
}

/**
 * Azure API Service Layer for real-time synchronization with Microsoft Azure SQL Database.
 */
export const azureApi = {
  /**
   * Health check to verify connection to Express & Azure SQL Database.
   */
  async checkHealth(): Promise<AzureHealthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Azure SQL Backend offline or unreachable, using client state.', err);
      return {
        status: 'offline',
        azureDbConnected: false,
        serverTime: new Date().toISOString(),
        message: 'Backend server offline or running in standalone mode.'
      };
    }
  },

  /**
   * Fetch all eFSR records from Azure SQL Database.
   */
  async getEFSRRecords(): Promise<EFSRRecord[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/efsr`);
      if (!res.ok) throw new Error(`Failed to fetch eFSR records: ${res.statusText}`);
      const data = await res.json();
      return data.records || [];
    } catch (err) {
      console.warn('Error connecting to Azure API GET /api/efsr:', err);
      throw err;
    }
  },

  /**
   * Submit a new eFSR record to Azure SQL Database.
   */
  async createEFSRRecord(record: Partial<EFSRRecord>): Promise<EFSRRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/efsr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (!res.ok) throw new Error(`Failed to save eFSR record: ${res.statusText}`);
      const data = await res.json();
      return data.record;
    } catch (err) {
      console.warn('Error connecting to Azure API POST /api/efsr:', err);
      throw err;
    }
  },

  /**
   * Update an existing eFSR record in Azure SQL Database.
   */
  async updateEFSRRecord(id: string, updates: Partial<EFSRRecord>): Promise<EFSRRecord> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/efsr/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error(`Failed to update eFSR record: ${res.statusText}`);
      const data = await res.json();
      return data.record;
    } catch (err) {
      console.warn(`Error updating eFSR record ${id} on Azure API:`, err);
      throw err;
    }
  },

  /**
   * Fetch system accounts from Azure SQL Database.
   */
  async getUsers(): Promise<AppUser[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
      const data = await res.json();
      return data.users || [];
    } catch (err) {
      console.warn('Error fetching users from Azure API:', err);
      throw err;
    }
  },

  /**
   * Create a new account (FT, Department Admin, Department User, Super Admin).
   */
  async createUser(user: Partial<AppUser>): Promise<AppUser> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) throw new Error(`Failed to create user: ${res.statusText}`);
      const data = await res.json();
      return data.user;
    } catch (err) {
      console.warn('Error creating user on Azure API:', err);
      throw err;
    }
  },

  /**
   * Update a user account in Azure SQL Database.
   */
  async updateUser(id: string, user: Partial<AppUser>): Promise<AppUser> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      if (!res.ok) throw new Error(`Failed to update user: ${res.statusText}`);
      const data = await res.json();
      return data.user;
    } catch (err) {
      console.warn(`Error updating user ${id}:`, err);
      throw err;
    }
  },

  /**
   * Delete a user account from Azure SQL Database.
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`Failed to delete user: ${res.statusText}`);
      return true;
    } catch (err) {
      console.warn(`Error deleting user ${id}:`, err);
      throw err;
    }
  }
};
