export type UserRole = 'owner' | 'marketing_staff';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type ContentFormat = 'poster' | 'carousel' | 'video' | 'text' | 'article';

export type ContentStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'threads'
  | 'tiktok'
  | 'linkedin'
  | 'website';

export interface ContentAsset {
  id: string;
  content_id: string;
  type: 'image' | 'video';
  url: string;
  position: number;
  alt_text?: string;
}

export interface ContentPlatformConfig {
  content_id: string;
  platform: SocialPlatform;
  message_override?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  message: string;
  cta_text?: string;
  cta_url?: string;
  format: ContentFormat;
  status: ContentStatus;
  category_id: string;
  tags: string[];
  video_url?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  times_scheduled?: number;
  last_used_at?: string | null;
  // Joins
  platforms?: ContentPlatformConfig[];
  assets?: ContentAsset[];
  category?: Category;
  creator?: UserProfile;
}

export type CalendarStatus = 'scheduled' | 'published' | 'missed' | 'cancelled';

export interface CalendarEntry {
  id: string;
  content_id: string;
  platform: SocialPlatform;
  scheduled_at: string;
  assigned_to: string;
  status: CalendarStatus;
  published_url?: string;
  notes?: string;
  // Joins
  content?: ContentItem;
  assignee?: UserProfile;
}

export interface CampaignEvent {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  color: string;
}

export interface AnalyticsPlatform {
  id: string;
  platform: SocialPlatform;
  period_start: string;
  period_end: string;
  followers: number;
  followers_gained: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  link_clicks: number;
  profile_visits: number;
  entered_by: string;
  created_at?: string;
}

export interface AnalyticsPost {
  id: string;
  calendar_entry_id: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  video_views: number;
  leads: number;
  recorded_at: string;
}

export interface AdSpend {
  id: string;
  platform: SocialPlatform;
  period_start: string;
  period_end: string;
  amount_rm: number;
  results: number; // Leads / pendaftaran
}

export interface ChatbotFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
}

export interface ChatbotLog {
  id: string;
  session_id: string;
  user_message: string;
  bot_reply: string;
  answered_from_faq: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
}

export interface SystemSettings {
  require_approval_before_scheduling: boolean;
  official_whatsapp: string;
  official_whatsapp_number: string;
  official_email: string;
  operating_hours: string;
  official_address: string;
  company_name: string;
}

export interface RawContentItem {
  id: string;
  title: string;
  link: string;
  category?: string;
  tags: string[];
  file_type?: 'drive' | 'video' | 'photo' | 'document' | 'other';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

