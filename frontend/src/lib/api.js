const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data;
}

export const workoutApi = {
  getRoutines: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/workouts/routines${query ? `?${query}` : ''}`);
  },

  createRoutine: (data) => request('/workouts/routines', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getRoutine: (id) => request(`/workouts/routines/${id}`),

  updateRoutine: (id, data) => request(`/workouts/routines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteRoutine: (id) => request(`/workouts/routines/${id}`, {
    method: 'DELETE',
  }),

  createLog: (data) => request('/workouts/logs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/workouts/logs${query ? `?${query}` : ''}`);
  },

  deleteLog: (id) => request(`/workouts/logs/${id}`, {
    method: 'DELETE',
  }),
};

export const userApi = {
  getProfile: () => request('/users/me'),

  updateProfile: (data) => request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  updatePreferences: (data) => request('/users/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  uploadPhoto: async (file) => {
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('photo', file);
    const response = await fetch(`${API_BASE}/users/me/photo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload photo');
    }
    return data;
  },
};

export const authApi = {
  changePassword: (data) => request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const exportApi = {
  downloadProgressCsv: async () => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE}/export/progress?format=csv`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to export data');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fitness-progress.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};


export const nutritionApi = {
  getLog: (date) => request(`/nutrition/logs/${date}`),

  addMealItem: (date, data) => request(`/nutrition/logs/${date}/meals`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateMealItem: (date, itemId, data) => request(`/nutrition/logs/${date}/meals/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  deleteMealItem: (date, itemId) => request(`/nutrition/logs/${date}/meals/${itemId}`, {
    method: 'DELETE',
  }),

  updateWater: (date, data) => request(`/nutrition/logs/${date}/water`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  updateGoals: (date, data) => request(`/nutrition/logs/${date}/goals`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  searchFoods: (query = '') => request(`/nutrition/foods/search${query ? `?q=${encodeURIComponent(query)}` : ''}`),
  getLogsRange: (startDate, endDate) => request(`/nutrition/logs-range?startDate=${startDate}&endDate=${endDate}`),
};

export const progressApi = {
  createMetric: (data) => request('/progress/metrics', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getMetrics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/progress/metrics${query ? `?${query}` : ''}`);
  },

  getWeightAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/progress/analytics/weight${query ? `?${query}` : ''}`);
  },

  getWorkoutAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/progress/analytics/workouts${query ? `?${query}` : ''}`);
  },

  getNutritionAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/progress/analytics/nutrition${query ? `?${query}` : ''}`);
  },
};

export const notificationApi = {
  getNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notifications${query ? `?${query}` : ''}`);
  },
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  sendTestEmail: (data = {}) => request('/notifications/test-email', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const supportApi = {
  createTicket: (data) => request('/support', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMyTickets: () => request('/support'),
};