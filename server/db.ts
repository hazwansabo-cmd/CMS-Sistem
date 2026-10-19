import fs from 'fs';
import path from 'path';
import {
  UserProfile,
  Category,
  ContentItem,
  ContentAsset,
  ContentPlatformConfig,
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
} from '../src/types/index.ts';

const DATA_FILE = path.resolve(process.cwd(), '.dummy_database.json');

export interface DatabaseState {
  profiles: UserProfile[];
  categories: Category[];
  content_items: ContentItem[];
  content_platforms: ContentPlatformConfig[];
  content_assets: ContentAsset[];
  calendar_entries: CalendarEntry[];
  campaign_events: CampaignEvent[];
  analytics_platform: AnalyticsPlatform[];
  analytics_posts: AnalyticsPost[];
  ad_spend: AdSpend[];
  chatbot_faq: ChatbotFAQ[];
  chatbot_logs: ChatbotLog[];
  activity_logs: ActivityLog[];
  settings: SystemSettings;
  raw_content: RawContentItem[];
}

export const getInitialData = (): DatabaseState => {
  const profiles: UserProfile[] = [
    {
      id: "usr-001",
      full_name: "Ustaz Hazwan Sabo",
      email: "hazwansabo@gmail.com",
      role: "owner",
      is_active: true,
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      created_at: new Date().toISOString(),
    },
  ];

  const categories: Category[] = [
    { id: "cat-001", name: "Promotions", color: "#0E9F9A" },
    { id: "cat-002", name: "Educational", color: "#3B82F6" },
    { id: "cat-003", name: "Testimonials", color: "#8B5CF6" },
    { id: "cat-004", name: "Announcements", color: "#F59E0B" },
    { id: "cat-005", name: "Daily Tips", color: "#10B981" },
    { id: "cat-006", name: "Events & Workshops", color: "#EC4899" },
  ];

  const settings: SystemSettings = {
    require_approval_before_scheduling: true,
    official_whatsapp: "https://wa.me/60192345678",
    official_whatsapp_number: "+6019-234 5678",
    official_email: "info@alaminedu.com.my",
    operating_hours: "Monday - Friday, 8:30 AM - 5:30 PM",
    official_address: "No 15, Jalan 9/2, Seksyen 9, 43650 Bandar Baru Bangi, Selangor, Malaysia",
    company_name: "Al Amin Edu Oasis Sdn Bhd",
  };

  return {
    profiles,
    categories,
    content_items: [],
    content_platforms: [],
    content_assets: [],
    calendar_entries: [],
    campaign_events: [],
    analytics_platform: [],
    analytics_posts: [],
    ad_spend: [],
    chatbot_faq: [],
    chatbot_logs: [],
    activity_logs: [],
    settings,
    raw_content: [],
  };
};

class DummyDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadData();
  }

  private loadData(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.raw_content) {
          parsed.raw_content = getInitialData().raw_content;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load database from file, initializing fresh data:', e);
    }
    const fresh = getInitialData();
    this.saveData(fresh);
    return fresh;
  }

  private saveData(data?: DatabaseState): void {
    try {
      const stateToSave = data || this.state;
      fs.writeFileSync(DATA_FILE, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write dummy database file:', e);
    }
  }

  public resetToDefault(): DatabaseState {
    this.state = getInitialData();
    this.saveData();
    return this.state;
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // --- Profiles ---
  public getProfiles(): UserProfile[] {
    return this.state.profiles;
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.state.profiles.find((p) => p.id === id);
  }

  public getProfileByEmail(email: string): UserProfile | undefined {
    return this.state.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.state.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.state.profiles[idx] = { ...this.state.profiles[idx], ...updates };
    this.saveData();
    return this.state.profiles[idx];
  }

  public createProfile(profile: Omit<UserProfile, 'id' | 'created_at'>): UserProfile {
    const newProfile: UserProfile = {
      ...profile,
      id: `usr-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    };
    this.state.profiles.push(newProfile);
    this.saveData();
    return newProfile;
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.state.categories;
  }

  public createCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now().toString().slice(-4)}`,
    };
    this.state.categories.push(newCat);
    this.saveData();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.state.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.state.categories[idx] = { ...this.state.categories[idx], ...updates };
    this.saveData();
    return this.state.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.state.categories.length;
    this.state.categories = this.state.categories.filter((c) => c.id !== id);
    this.saveData();
    return this.state.categories.length < initialLen;
  }

  // --- Content Items & Joins ---
  public getContentItems(): ContentItem[] {
    const items = [...this.state.content_items];
    return items.map((item) => this.hydrateContentItem(item));
  }

  public getContentItemById(id: string): ContentItem | null {
    const item = this.state.content_items.find((c) => c.id === id);
    if (!item) return null;
    return this.hydrateContentItem(item);
  }

  private hydrateContentItem(item: ContentItem): ContentItem {
    const platforms = this.state.content_platforms.filter((cp) => cp.content_id === item.id);
    const assets = this.state.content_assets
      .filter((ca) => ca.content_id === item.id)
      .sort((a, b) => a.position - b.position);
    const category = this.state.categories.find((c) => c.id === item.category_id);
    const creator = this.state.profiles.find((p) => p.id === item.created_by);

    const calendarEntries = this.state.calendar_entries.filter((ce) => ce.content_id === item.id);
    const timesScheduled = calendarEntries.length;
    let lastUsedAt: string | null = null;
    if (calendarEntries.length > 0) {
      const dates = calendarEntries.map((ce) => new Date(ce.scheduled_at).getTime());
      lastUsedAt = new Date(Math.max(...dates)).toISOString();
    }

    return {
      ...item,
      platforms,
      assets,
      category,
      creator,
      times_scheduled: timesScheduled,
      last_used_at: lastUsedAt,
    };
  }

  public createContentItem(
    itemData: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>,
    platformsData: { platform: any; message_override?: string }[],
    assetsData: { type: 'image' | 'video'; url: string; position: number; alt_text?: string }[]
  ): ContentItem {
    const id = `cnt-${Date.now().toString().slice(-5)}`;
    const now = new Date().toISOString();
    const newItem: ContentItem = {
      ...itemData,
      id,
      created_at: now,
      updated_at: now,
      times_scheduled: 0,
      last_used_at: null,
    };
    this.state.content_items.unshift(newItem);

    if (platformsData && platformsData.length > 0) {
      platformsData.forEach((p) => {
        this.state.content_platforms.push({
          content_id: id,
          platform: p.platform,
          message_override: p.message_override,
        });
      });
    }

    if (assetsData && assetsData.length > 0) {
      assetsData.forEach((a, idx) => {
        this.state.content_assets.push({
          id: `ast-${Date.now().toString().slice(-4)}-${idx}`,
          content_id: id,
          type: a.type,
          url: a.url,
          position: a.position || idx + 1,
          alt_text: a.alt_text || '',
        });
      });
    }

    this.saveData();
    return this.hydrateContentItem(newItem);
  }

  public updateContentItem(
    id: string,
    updates: Partial<ContentItem>,
    platformsData?: { platform: any; message_override?: string }[],
    assetsData?: { type: 'image' | 'video'; url: string; position: number; alt_text?: string }[]
  ): ContentItem | null {
    const idx = this.state.content_items.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.state.content_items[idx] = {
      ...this.state.content_items[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (platformsData) {
      this.state.content_platforms = this.state.content_platforms.filter((cp) => cp.content_id !== id);
      platformsData.forEach((p) => {
        this.state.content_platforms.push({
          content_id: id,
          platform: p.platform,
          message_override: p.message_override,
        });
      });
    }

    if (assetsData) {
      this.state.content_assets = this.state.content_assets.filter((ca) => ca.content_id !== id);
      assetsData.forEach((a, aIdx) => {
        this.state.content_assets.push({
          id: `ast-${Date.now().toString().slice(-4)}-${aIdx}`,
          content_id: id,
          type: a.type,
          url: a.url,
          position: a.position || aIdx + 1,
          alt_text: a.alt_text || '',
        });
      });
    }

    this.saveData();
    return this.hydrateContentItem(this.state.content_items[idx]);
  }

  public duplicateContentItem(id: string, user_id: string): ContentItem | null {
    const original = this.getContentItemById(id);
    if (!original) return null;

    const newTitle = `(Copy) ${original.title}`.slice(0, 150);
    const platforms = original.platforms?.map((p) => ({
      platform: p.platform,
      message_override: p.message_override,
    })) || [];
    const assets = original.assets?.map((a) => ({
      type: a.type,
      url: a.url,
      position: a.position,
      alt_text: a.alt_text,
    })) || [];

    return this.createContentItem(
      {
        title: newTitle,
        message: original.message,
        cta_text: original.cta_text,
        cta_url: original.cta_url,
        format: original.format,
        status: 'draft',
        category_id: original.category_id,
        tags: [...original.tags],
        video_url: original.video_url,
        created_by: user_id,
        updated_by: user_id,
      },
      platforms,
      assets
    );
  }

  public deleteContentItem(id: string): boolean {
    const initialLen = this.state.content_items.length;
    this.state.content_items = this.state.content_items.filter((c) => c.id !== id);
    this.state.content_platforms = this.state.content_platforms.filter((cp) => cp.content_id !== id);
    this.state.content_assets = this.state.content_assets.filter((ca) => ca.content_id !== id);
    this.state.calendar_entries = this.state.calendar_entries.filter((ce) => ce.content_id !== id);
    this.saveData();
    return this.state.content_items.length < initialLen;
  }

  // --- Calendar Entries ---
  public getCalendarEntries(): CalendarEntry[] {
    return this.state.calendar_entries.map((entry) => {
      const content = this.getContentItemById(entry.content_id) || undefined;
      const assignee = this.state.profiles.find((p) => p.id === entry.assigned_to);
      return {
        ...entry,
        content,
        assignee,
      };
    });
  }

  public createCalendarEntry(entry: Omit<CalendarEntry, 'id'>): CalendarEntry {
    const id = `cal-${Date.now().toString().slice(-4)}`;
    const newEntry: CalendarEntry = {
      ...entry,
      id,
    };
    this.state.calendar_entries.push(newEntry);

    const content = this.state.content_items.find((c) => c.id === entry.content_id);
    if (content && (content.status === 'draft' || content.status === 'approved')) {
      content.status = 'scheduled';
      content.updated_at = new Date().toISOString();
    }

    this.saveData();
    const hydContent = this.getContentItemById(entry.content_id) || undefined;
    const assignee = this.state.profiles.find((p) => p.id === entry.assigned_to);
    return { ...newEntry, content: hydContent, assignee };
  }

  public updateCalendarEntry(id: string, updates: Partial<CalendarEntry>): CalendarEntry | null {
    const idx = this.state.calendar_entries.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    this.state.calendar_entries[idx] = {
      ...this.state.calendar_entries[idx],
      ...updates,
    };

    if (updates.status === 'published') {
      const content = this.state.content_items.find((c) => c.id === this.state.calendar_entries[idx].content_id);
      if (content) {
        content.status = 'published';
        content.updated_at = new Date().toISOString();
      }
    }

    this.saveData();
    const hydContent = this.getContentItemById(this.state.calendar_entries[idx].content_id) || undefined;
    const assignee = this.state.profiles.find((p) => p.id === this.state.calendar_entries[idx].assigned_to);
    return { ...this.state.calendar_entries[idx], content: hydContent, assignee };
  }

  public deleteCalendarEntry(id: string): boolean {
    const initialLen = this.state.calendar_entries.length;
    this.state.calendar_entries = this.state.calendar_entries.filter((c) => c.id !== id);
    this.saveData();
    return this.state.calendar_entries.length < initialLen;
  }

  // --- Campaign Events ---
  public getCampaignEvents(): CampaignEvent[] {
    return this.state.campaign_events;
  }

  public createCampaignEvent(event: Omit<CampaignEvent, 'id'>): CampaignEvent {
    const newEvent: CampaignEvent = {
      ...event,
      id: `cmp-${Date.now().toString().slice(-4)}`,
    };
    this.state.campaign_events.push(newEvent);
    this.saveData();
    return newEvent;
  }

  public deleteCampaignEvent(id: string): boolean {
    const initialLen = this.state.campaign_events.length;
    this.state.campaign_events = this.state.campaign_events.filter((e) => e.id !== id);
    this.saveData();
    return this.state.campaign_events.length < initialLen;
  }

  // --- Analytics Platform & Posts & Ad Spend ---
  public getAnalyticsPlatform(): AnalyticsPlatform[] {
    return this.state.analytics_platform;
  }

  public createAnalyticsPlatform(data: Omit<AnalyticsPlatform, 'id'>): AnalyticsPlatform {
    const newAnl: AnalyticsPlatform = {
      ...data,
      id: `anl-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
    };
    this.state.analytics_platform.unshift(newAnl);
    this.saveData();
    return newAnl;
  }

  public getAnalyticsPosts(): AnalyticsPost[] {
    return this.state.analytics_posts;
  }

  public createAnalyticsPost(data: Omit<AnalyticsPost, 'id' | 'recorded_at'>): AnalyticsPost {
    const newPostAnl: AnalyticsPost = {
      ...data,
      id: `anlp-${Date.now().toString().slice(-4)}`,
      recorded_at: new Date().toISOString(),
    };
    this.state.analytics_posts.unshift(newPostAnl);
    this.saveData();
    return newPostAnl;
  }

  public getAdSpend(): AdSpend[] {
    return this.state.ad_spend;
  }

  public createAdSpend(data: Omit<AdSpend, 'id'>): AdSpend {
    const newAd: AdSpend = {
      ...data,
      id: `ads-${Date.now().toString().slice(-4)}`,
    };
    this.state.ad_spend.unshift(newAd);
    this.saveData();
    return newAd;
  }

  // --- Chatbot FAQ ---
  public getFAQs(): ChatbotFAQ[] {
    return this.state.chatbot_faq;
  }

  public getActiveFAQs(): ChatbotFAQ[] {
    return this.state.chatbot_faq.filter((f) => f.is_active);
  }

  public createFAQ(faq: Omit<ChatbotFAQ, 'id'>): ChatbotFAQ {
    const newFaq: ChatbotFAQ = {
      ...faq,
      id: `faq-${Date.now().toString().slice(-4)}`,
    };
    this.state.chatbot_faq.push(newFaq);
    this.saveData();
    return newFaq;
  }

  public updateFAQ(id: string, updates: Partial<ChatbotFAQ>): ChatbotFAQ | null {
    const idx = this.state.chatbot_faq.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.state.chatbot_faq[idx] = { ...this.state.chatbot_faq[idx], ...updates };
    this.saveData();
    return this.state.chatbot_faq[idx];
  }

  public deleteFAQ(id: string): boolean {
    const initialLen = this.state.chatbot_faq.length;
    this.state.chatbot_faq = this.state.chatbot_faq.filter((f) => f.id !== id);
    this.saveData();
    return this.state.chatbot_faq.length < initialLen;
  }

  // --- Chatbot Logs ---
  public getChatbotLogs(): ChatbotLog[] {
    return this.state.chatbot_logs;
  }

  public logChatbotQuery(
    sessionId: string,
    userMessage: string,
    botReply: string,
    answeredFromFAQ: boolean
  ): ChatbotLog {
    const log: ChatbotLog = {
      id: `log-${Date.now().toString().slice(-5)}`,
      session_id: sessionId,
      user_message: userMessage,
      bot_reply: botReply,
      answered_from_faq: answeredFromFAQ,
      created_at: new Date().toISOString(),
    };
    this.state.chatbot_logs.unshift(log);
    if (this.state.chatbot_logs.length > 200) {
      this.state.chatbot_logs = this.state.chatbot_logs.slice(0, 200);
    }
    this.saveData();
    return log;
  }

  // --- Activity Logs ---
  public getActivityLogs(): ActivityLog[] {
    return this.state.activity_logs;
  }

  public logActivity(userId: string, userName: string, action: string, details: string): ActivityLog {
    const log: ActivityLog = {
      id: `act-${Date.now().toString().slice(-5)}`,
      user_id: userId,
      user_name: userName,
      action,
      details,
      created_at: new Date().toISOString(),
    };
    this.state.activity_logs.unshift(log);
    if (this.state.activity_logs.length > 200) {
      this.state.activity_logs = this.state.activity_logs.slice(0, 200);
    }
    this.saveData();
    return log;
  }

  // --- Settings ---
  public getSettings(): SystemSettings {
    return this.state.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.state.settings = { ...this.state.settings, ...updates };
    this.saveData();
    return this.state.settings;
  }

  // --- Raw Content Vault ---
  public getRawContent(): RawContentItem[] {
    return this.state.raw_content || [];
  }

  public createRawContent(data: Omit<RawContentItem, 'id' | 'created_at'>): RawContentItem {
    const newItem: RawContentItem = {
      ...data,
      id: `raw-${Date.now().toString().slice(-6)}`,
      created_at: new Date().toISOString(),
    };
    if (!this.state.raw_content) {
      this.state.raw_content = [];
    }
    this.state.raw_content.unshift(newItem);
    this.saveData();
    return newItem;
  }

  public updateRawContent(id: string, updates: Partial<RawContentItem>): RawContentItem | null {
    if (!this.state.raw_content) return null;
    const idx = this.state.raw_content.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.state.raw_content[idx] = {
      ...this.state.raw_content[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData();
    return this.state.raw_content[idx];
  }

  public deleteRawContent(id: string): boolean {
    if (!this.state.raw_content) return false;
    const lenBefore = this.state.raw_content.length;
    this.state.raw_content = this.state.raw_content.filter((r) => r.id !== id);
    this.saveData();
    return this.state.raw_content.length < lenBefore;
  }
}

export const db = new DummyDatabase();
