import {
  UserProfile,
  Category,
  ContentItem,
  CalendarEntry,
  CampaignEvent,
  AnalyticsPlatform,
  AnalyticsPost,
  AdSpend,
  ChatbotFAQ,
  ChatbotLog,
  ActivityLog,
  SystemSettings,
  RawContentItem,
} from '../types/index.ts';

// Storage key for active user ID
const USER_KEY = 'alamin_active_user_id';

export const getStoredUserId = (): string => {
  return localStorage.getItem(USER_KEY) || 'usr-001';
};

export const setStoredUserId = (id: string) => {
  localStorage.setItem(USER_KEY, id);
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const userId = getStoredUserId();
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMsg = 'Ralat sambungan pelayan';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // Auth & Profiles
  login: (email: string, password: string) =>
    fetchJson<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getSession: () => fetchJson<{ user: UserProfile }>('/api/auth/session'),
  getProfiles: () => fetchJson<UserProfile[]>('/api/profiles'),
  inviteProfile: (data: { full_name: string; email: string; role: string }) =>
    fetchJson<UserProfile>('/api/profiles/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProfile: (id: string, updates: Partial<UserProfile>) =>
    fetchJson<UserProfile>(`/api/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Categories
  getCategories: () => fetchJson<Category[]>('/api/categories'),
  createCategory: (name: string, color: string) =>
    fetchJson<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    }),
  updateCategory: (id: string, updates: Partial<Category>) =>
    fetchJson<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteCategory: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/categories/${id}`, { method: 'DELETE' }),

  // Content Library
  getContentItems: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson<ContentItem[]>(`/api/content${query ? `?${query}` : ''}`);
  },
  getContentItemById: (id: string) => fetchJson<ContentItem>(`/api/content/${id}`),
  createContentItem: (payload: any) =>
    fetchJson<ContentItem>('/api/content', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateContentItem: (id: string, payload: any) =>
    fetchJson<ContentItem>(`/api/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  duplicateContentItem: (id: string) =>
    fetchJson<ContentItem>(`/api/content/${id}/duplicate`, { method: 'POST' }),
  deleteContentItem: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/content/${id}`, { method: 'DELETE' }),
  bulkContentAction: (ids: string[], action: 'status' | 'archive' | 'add_tag', value: string) =>
    fetchJson<{ success: boolean; affected: number }>('/api/content/bulk', {
      method: 'POST',
      body: JSON.stringify({ ids, action, value }),
    }),

  // Calendar
  getCalendarEntries: () => fetchJson<CalendarEntry[]>('/api/calendar'),
  createCalendarEntry: (payload: any) =>
    fetchJson<CalendarEntry>('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCalendarEntry: (id: string, payload: any) =>
    fetchJson<CalendarEntry>(`/api/calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteCalendarEntry: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/calendar/${id}`, { method: 'DELETE' }),

  // Campaign Events
  getCampaigns: () => fetchJson<CampaignEvent[]>('/api/campaigns'),
  createCampaign: (data: { title: string; start_date: string; end_date: string; color?: string }) =>
    fetchJson<CampaignEvent>('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteCampaign: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/campaigns/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalyticsPlatform: () => fetchJson<AnalyticsPlatform[]>('/api/analytics/platform'),
  createAnalyticsPlatform: (payload: any) =>
    fetchJson<AnalyticsPlatform>('/api/analytics/platform', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  importAnalyticsCsv: (rows: any[]) =>
    fetchJson<{ success: boolean; count: number }>('/api/analytics/import-csv', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    }),
  getAnalyticsPosts: () => fetchJson<AnalyticsPost[]>('/api/analytics/posts'),
  createAnalyticsPost: (payload: any) =>
    fetchJson<AnalyticsPost>('/api/analytics/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAdSpend: () => fetchJson<AdSpend[]>('/api/analytics/ad-spend'),
  createAdSpend: (payload: any) =>
    fetchJson<AdSpend>('/api/analytics/ad-spend', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // FAQ & Chatbot
  getFAQs: () => fetchJson<ChatbotFAQ[]>('/api/faq'),
  createFAQ: (payload: any) =>
    fetchJson<ChatbotFAQ>('/api/faq', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateFAQ: (id: string, updates: Partial<ChatbotFAQ>) =>
    fetchJson<ChatbotFAQ>(`/api/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteFAQ: (id: string) => fetchJson<{ success: boolean }>(`/api/faq/${id}`, { method: 'DELETE' }),

  askChatbot: (sessionId: string, message: string, useThinking = false) =>
    fetchJson<{ reply: string; answered_from_faq: boolean }>('/api/chatbot/ask', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, message, use_thinking: useThinking }),
    }),
  getChatbotLogs: () => fetchJson<ChatbotLog[]>('/api/chatbot/logs'),

  // AI Assistance
  getAiVariations: (data: {
    title: string;
    message?: string;
    platform?: string;
    task: 'variations' | 'cta' | 'rewrite';
    use_thinking?: boolean;
  }) =>
    fetchJson<{ success: boolean; text: string }>('/api/ai/variations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAiMonthlySummary: (useThinking = false) =>
    fetchJson<{ success: boolean; text: string }>('/api/ai/monthly-summary', {
      method: 'POST',
      body: JSON.stringify({ use_thinking: useThinking }),
    }),

  // Logs & Settings
  getActivityLogs: () => fetchJson<ActivityLog[]>('/api/activity-logs'),
  getSettings: () => fetchJson<SystemSettings>('/api/settings'),
  updateSettings: (updates: Partial<SystemSettings>) =>
    fetchJson<SystemSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  // Raw Content Vault
  getRawContent: () => fetchJson<RawContentItem[]>('/api/raw-content'),
  createRawContent: (data: {
    title: string;
    link: string;
    category?: string;
    tags?: string[];
    file_type?: string;
    notes?: string;
  }) =>
    fetchJson<RawContentItem>('/api/raw-content', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRawContent: (id: string, updates: Partial<RawContentItem>) =>
    fetchJson<RawContentItem>(`/api/raw-content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteRawContent: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/raw-content/${id}`, { method: 'DELETE' }),

  resetDatabase: () => fetchJson<{ success: boolean; message: string }>('/api/db/reset', { method: 'POST' }),
};
