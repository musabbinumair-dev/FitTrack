import { User } from '../types/fitness';
import { AdminAnalyticsData, AdminUsersQuery, AdminUsersResponse } from '../types/admin';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const adminApi = {
  // GET /api/admin/users
  async getUsers(query: AdminUsersQuery = {}): Promise<AdminUsersResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.status && query.status !== 'all') params.append('status', query.status);
    if (query.role && query.role !== 'all') params.append('role', query.role);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Failed to fetch users: ${res.statusText}`);
    }
    return res.json();
  },

  // POST /api/admin/users
  async createUser(payload: Record<string, any>): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Failed to create user: ${res.statusText}`);
    }
    const data = await res.json();
    return data.user || data;
  },

  // GET /api/admin/users/:id
  async getUserById(id: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Failed to fetch user ${id}: ${res.statusText}`);
    }
    const data = await res.json();
    return data.user || data;
  },

  // PATCH /api/admin/users/:id
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Failed to update user: ${res.statusText}`);
    }
    const data = await res.json();
    return data.user || data;
  },

  // DELETE /api/admin/users/:id
  async deleteUser(id: string): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Failed to delete user: ${res.statusText}`);
    }
    return res.json();
  },

  // GET /api/admin/analytics
  async getAnalytics(): Promise<AdminAnalyticsData> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Failed to fetch analytics: ${res.statusText}`);
    }
    return res.json();
  },

  // GET /api/admin/notifications
  async getNotifications(): Promise<{ notifications: any[]; unreadCount: number }> {
    const res = await fetch(`${API_BASE}/admin/notifications`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      return { notifications: [], unreadCount: 0 };
    }
    return res.json();
  },

  // POST /api/admin/notifications/mark-read
  async markNotificationsRead(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/notifications/mark-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },
};

export default adminApi;
