import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { askOasisChatbot, generateContentVariations, generateMonthlySummary } from './server/gemini.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper to simulate current logged in user from header or fallback
function getCurrentUser(req: Request) {
  const userId = req.headers['x-user-id'] as string;
  if (userId) {
    const user = db.getProfileById(userId);
    if (user && user.is_active) return user;
  }
  // Default to Owner (Ustaz Hazwan Sabo) if no header
  return db.getProfileById('usr-001') || db.getProfiles()[0];
}

// ----------------- AUTH & PROFILES -----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter your email and password.' });
  }

  // Find user by email
  const user = db.getProfileByEmail(email);
  if (!user || !user.is_active) {
    // PRD AUTH-06: Error message that does not disclose whether email exists
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  db.logActivity(user.id, user.full_name, 'User Sign In', `${user.full_name} (${user.role}) signed in successfully.`);
  return res.json({
    token: `token-${user.id}-${Date.now()}`,
    user,
  });
});

app.get('/api/auth/session', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  res.json({ user });
});

app.get('/api/profiles', (req: Request, res: Response) => {
  res.json(db.getProfiles());
});

app.post('/api/profiles/invite', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  if (currentUser.role !== 'owner') {
    return res.status(403).json({ error: 'Only the Owner is authorized to manage users.' });
  }

  const { full_name, email, role } = req.body;
  if (!full_name || !email) {
    return res.status(400).json({ error: 'Full name and email are required.' });
  }

  const existing = db.getProfileByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'This email is already registered.' });
  }

  const newProfile = db.createProfile({
    full_name,
    email,
    role: role === 'owner' ? 'owner' : 'marketing_staff',
    is_active: true,
    avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
  });

  db.logActivity(currentUser.id, currentUser.full_name, 'Invite Staff', `Invited new team member: ${full_name} (${email}).`);
  res.status(201).json(newProfile);
});

app.put('/api/profiles/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  if (currentUser.role !== 'owner') {
    return res.status(403).json({ error: 'Only the Owner is authorized to change staff roles.' });
  }

  const { id } = req.params;
  const { role, is_active } = req.body;
  const updated = db.updateProfile(id, { role, is_active });
  if (!updated) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  db.logActivity(currentUser.id, currentUser.full_name, 'Update Staff Profile', `Modified permissions for ${updated.full_name}.`);
  res.json(updated);
});

// ----------------- CATEGORIES -----------------
app.get('/api/categories', (req: Request, res: Response) => {
  res.json(db.getCategories());
});

app.post('/api/categories', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required.' });

  const cat = db.createCategory({ name, color: color || '#0E9F9A' });
  db.logActivity(currentUser.id, currentUser.full_name, 'Add Category', `Created category "${name}".`);
  res.status(201).json(cat);
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { id } = req.params;
  const { name, color } = req.body;
  const updated = db.updateCategory(id, { name, color });
  if (!updated) return res.status(404).json({ error: 'Category not found.' });
  db.logActivity(currentUser.id, currentUser.full_name, 'Update Category', `Updated category "${updated.name}".`);
  res.json(updated);
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  if (currentUser.role !== 'owner') {
    return res.status(403).json({ error: 'Only the Owner can delete categories.' });
  }
  const { id } = req.params;
  db.deleteCategory(id);
  res.json({ success: true });
});

// ----------------- CONTENT LIBRARY -----------------
app.get('/api/content', (req: Request, res: Response) => {
  let items = db.getContentItems();
  const { search, platform, category_id, status, format } = req.query;

  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (platform) {
    items = items.filter((item) =>
      item.platforms?.some((p) => p.platform.toLowerCase() === (platform as string).toLowerCase())
    );
  }

  if (category_id) {
    items = items.filter((item) => item.category_id === category_id);
  }

  if (status) {
    items = items.filter((item) => item.status === status);
  }

  if (format) {
    items = items.filter((item) => item.format === format);
  }

  res.json(items);
});

app.get('/api/content/:id', (req: Request, res: Response) => {
  const item = db.getContentItemById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Content item not found.' });
  res.json(item);
});

app.post('/api/content', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { title, message, cta_text, cta_url, format, status, category_id, tags, video_url, platforms, assets } =
    req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required.' });
  }

  const settings = db.getSettings();
  let finalStatus = status || 'draft';
  // If settings require approval and creator is staff and submitted for scheduling
  if (settings.require_approval_before_scheduling && currentUser.role === 'marketing_staff') {
    if (finalStatus === 'scheduled' || finalStatus === 'approved') {
      finalStatus = 'pending_approval';
    }
  }

  const created = db.createContentItem(
    {
      title: title.slice(0, 150),
      message,
      cta_text: cta_text || '',
      cta_url: cta_url || '',
      format: format || 'poster',
      status: finalStatus,
      category_id: category_id || db.getCategories()[0].id,
      tags: Array.isArray(tags) ? tags : [],
      video_url: video_url || '',
      created_by: currentUser.id,
      updated_by: currentUser.id,
    },
    platforms || [],
    assets || []
  );

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Create Content',
    `Created new content item: "${created.title}" [${created.status}].`
  );

  res.status(201).json(created);
});

app.put('/api/content/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { id } = req.params;
  const { title, message, cta_text, cta_url, format, status, category_id, tags, video_url, platforms, assets } =
    req.body;

  const existing = db.getContentItemById(id);
  if (!existing) return res.status(404).json({ error: 'Content item not found.' });

  // Access check: only owner can approve
  let newStatus = status || existing.status;
  if (newStatus === 'approved' && currentUser.role !== 'owner') {
    return res.status(403).json({ error: 'Only the Owner can approve content.' });
  }

  const updated = db.updateContentItem(
    id,
    {
      title: title !== undefined ? title.slice(0, 150) : existing.title,
      message: message !== undefined ? message : existing.message,
      cta_text: cta_text !== undefined ? cta_text : existing.cta_text,
      cta_url: cta_url !== undefined ? cta_url : existing.cta_url,
      format: format !== undefined ? format : existing.format,
      status: newStatus,
      category_id: category_id !== undefined ? category_id : existing.category_id,
      tags: tags !== undefined ? tags : existing.tags,
      video_url: video_url !== undefined ? video_url : existing.video_url,
      updated_by: currentUser.id,
    },
    platforms,
    assets
  );

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Update Content',
    `Updated content item: "${updated?.title}".`
  );

  res.json(updated);
});

app.post('/api/content/:id/duplicate', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const duplicated = db.duplicateContentItem(req.params.id, currentUser.id);
  if (!duplicated) return res.status(404).json({ error: 'Original content not found.' });

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Duplicate Content',
    `Duplicated content item to "${duplicated.title}".`
  );

  res.status(201).json(duplicated);
});

app.delete('/api/content/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  if (currentUser.role !== 'owner') {
    return res.status(403).json({ error: 'Only the Owner is authorized to permanently delete content.' });
  }

  const item = db.getContentItemById(req.params.id);
  const deleted = db.deleteContentItem(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Content item not found.' });

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Delete Content',
    `Permanently deleted content: "${item?.title || req.params.id}".`
  );

  res.json({ success: true });
});

// Bulk operations (LIB-09)
app.post('/api/content/bulk', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { ids, action, value } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'List of IDs is required.' });
  }

  let count = 0;
  for (const id of ids) {
    if (action === 'status') {
      db.updateContentItem(id, { status: value });
      count++;
    } else if (action === 'archive') {
      db.updateContentItem(id, { status: 'archived' });
      count++;
    } else if (action === 'add_tag') {
      const item = db.getContentItemById(id);
      if (item && !item.tags.includes(value)) {
        db.updateContentItem(id, { tags: [...item.tags, value] });
        count++;
      }
    }
  }

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Bulk Action',
    `Executed ${action} on ${count} content items.`
  );

  res.json({ success: true, affected: count });
});

// ----------------- CALENDAR -----------------
app.get('/api/calendar', (req: Request, res: Response) => {
  res.json(db.getCalendarEntries());
});

app.post('/api/calendar', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { content_id, platform, platforms, scheduled_at, assigned_to, status, notes } = req.body;

  if (!content_id || (!platform && (!platforms || platforms.length === 0)) || !scheduled_at) {
    return res.status(400).json({ error: 'Content, platform selection, and schedule date are required.' });
  }

  // Multi-platform support: if platforms array is provided, create entry for each selected platform
  const targetPlatforms: string[] = Array.isArray(platforms) && platforms.length > 0
    ? platforms
    : [platform];

  const createdEntries = targetPlatforms.map((plat) =>
    db.createCalendarEntry({
      content_id,
      platform: plat as any,
      scheduled_at,
      assigned_to: assigned_to || currentUser.id,
      status: status || 'scheduled',
      notes: notes || '',
    })
  );

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Schedule Content',
    `Scheduled post for ${targetPlatforms.join(', ')} on ${new Date(scheduled_at).toLocaleDateString('en-US')}.`
  );

  res.status(201).json(createdEntries.length === 1 ? createdEntries[0] : createdEntries);
});

app.put('/api/calendar/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { id } = req.params;
  const { scheduled_at, status, published_url, notes, platform, assigned_to } = req.body;

  const updated = db.updateCalendarEntry(id, {
    scheduled_at,
    status,
    published_url,
    notes,
    platform,
    assigned_to,
  });

  if (!updated) return res.status(404).json({ error: 'Calendar entry not found.' });

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Update Calendar',
    `Updated calendar entry #${id} (Status: ${updated.status}).`
  );

  res.json(updated);
});

app.delete('/api/calendar/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const deleted = db.deleteCalendarEntry(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Calendar entry not found.' });

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Delete Calendar Entry',
    `Removed schedule entry #${req.params.id}.`
  );

  res.json({ success: true });
});

// ----------------- CAMPAIGNS -----------------
app.get('/api/campaigns', (req: Request, res: Response) => {
  res.json(db.getCampaignEvents());
});

app.post('/api/campaigns', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { title, start_date, end_date, color } = req.body;
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: 'Title, start date, and end date are required.' });
  }

  const event = db.createCampaignEvent({
    title,
    start_date,
    end_date,
    color: color || '#0E9F9A',
  });

  db.logActivity(currentUser.id, currentUser.full_name, 'Add Campaign', `Created campaign event: "${title}".`);
  res.status(201).json(event);
});

app.delete('/api/campaigns/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  db.deleteCampaignEvent(req.params.id);
  db.logActivity(currentUser.id, currentUser.full_name, 'Delete Campaign', `Removed campaign event #${req.params.id}.`);
  res.json({ success: true });
});

// ----------------- ANALYTICS -----------------
app.get('/api/analytics/platform', (req: Request, res: Response) => {
  res.json(db.getAnalyticsPlatform());
});

app.post('/api/analytics/platform', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const {
    platform,
    period_start,
    period_end,
    followers,
    followers_gained,
    reach,
    impressions,
    likes,
    comments,
    shares,
    saves,
    link_clicks,
    profile_visits,
  } = req.body;

  if (!platform || !period_start || !period_end) {
    return res.status(400).json({ error: 'Platform and date range are required.' });
  }

  const record = db.createAnalyticsPlatform({
    platform,
    period_start,
    period_end,
    followers: Math.max(0, Number(followers) || 0),
    followers_gained: Number(followers_gained) || 0,
    reach: Math.max(0, Number(reach) || 0),
    impressions: Math.max(0, Number(impressions) || 0),
    likes: Math.max(0, Number(likes) || 0),
    comments: Math.max(0, Number(comments) || 0),
    shares: Math.max(0, Number(shares) || 0),
    saves: Math.max(0, Number(saves) || 0),
    link_clicks: Math.max(0, Number(link_clicks) || 0),
    profile_visits: Math.max(0, Number(profile_visits) || 0),
    entered_by: currentUser.id,
  });

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Record Analytics Data',
    `Recorded platform analytics for ${platform}.`
  );

  res.status(201).json(record);
});

app.post('/api/analytics/import-csv', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Invalid CSV data format or empty rows.' });
  }

  let count = 0;
  for (const row of rows) {
    if (row.platform && row.period_start && row.period_end) {
      db.createAnalyticsPlatform({
        platform: row.platform.toLowerCase(),
        period_start: row.period_start,
        period_end: row.period_end,
        followers: Number(row.followers) || 0,
        followers_gained: Number(row.followers_gained) || 0,
        reach: Number(row.reach) || 0,
        impressions: Number(row.impressions) || 0,
        likes: Number(row.likes) || 0,
        comments: Number(row.comments) || 0,
        shares: Number(row.shares) || 0,
        saves: Number(row.saves) || 0,
        link_clicks: Number(row.link_clicks) || 0,
        profile_visits: Number(row.profile_visits) || 0,
        entered_by: currentUser.id,
      });
      count++;
    }
  }

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Import Analytics CSV',
    `Successfully imported ${count} analytics records.`
  );

  res.json({ success: true, count });
});

app.get('/api/analytics/posts', (req: Request, res: Response) => {
  res.json(db.getAnalyticsPosts());
});

app.post('/api/analytics/posts', (req: Request, res: Response) => {
  const { calendar_entry_id, reach, impressions, likes, comments, shares, saves, clicks, video_views, leads } =
    req.body;

  if (!calendar_entry_id) {
    return res.status(400).json({ error: 'Calendar post entry ID is required.' });
  }

  const postRecord = db.createAnalyticsPost({
    calendar_entry_id,
    reach: Math.max(0, Number(reach) || 0),
    impressions: Math.max(0, Number(impressions) || 0),
    likes: Math.max(0, Number(likes) || 0),
    comments: Math.max(0, Number(comments) || 0),
    shares: Math.max(0, Number(shares) || 0),
    saves: Math.max(0, Number(saves) || 0),
    clicks: Math.max(0, Number(clicks) || 0),
    video_views: Math.max(0, Number(video_views) || 0),
    leads: Math.max(0, Number(leads) || 0),
  });

  res.status(201).json(postRecord);
});

app.get('/api/analytics/ad-spend', (req: Request, res: Response) => {
  res.json(db.getAdSpend());
});

app.post('/api/analytics/ad-spend', (req: Request, res: Response) => {
  const { platform, period_start, period_end, amount_rm, results } = req.body;
  if (!platform || !amount_rm) {
    return res.status(400).json({ error: 'Platform and ad spend budget amount are required.' });
  }

  const ad = db.createAdSpend({
    platform,
    period_start: period_start || new Date().toISOString().split('T')[0],
    period_end: period_end || new Date().toISOString().split('T')[0],
    amount_rm: Number(amount_rm) || 0,
    results: Number(results) || 0,
  });

  res.status(201).json(ad);
});

// ----------------- CHATBOT FAQ & LOGS -----------------
app.get('/api/faq', (req: Request, res: Response) => {
  res.json(db.getFAQs());
});

app.post('/api/faq', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { question, answer, category, is_active } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'FAQ question and answer are required.' });
  }

  const newFaq = db.createFAQ({
    question,
    answer,
    category: category || 'General',
    is_active: is_active !== undefined ? is_active : true,
  });

  db.logActivity(currentUser.id, currentUser.full_name, 'Add FAQ', `Created FAQ question: "${question.slice(0, 40)}..."`);
  res.status(201).json(newFaq);
});

app.put('/api/faq/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { id } = req.params;
  const { question, answer, category, is_active } = req.body;
  const updated = db.updateFAQ(id, { question, answer, category, is_active });
  if (!updated) return res.status(404).json({ error: 'FAQ not found.' });

  db.logActivity(currentUser.id, currentUser.full_name, 'Update FAQ', `Updated FAQ #${id}.`);
  res.json(updated);
});

app.delete('/api/faq/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  db.deleteFAQ(req.params.id);
  db.logActivity(currentUser.id, currentUser.full_name, 'Delete FAQ', `Deleted FAQ #${req.params.id}.`);
  res.json({ success: true });
});

// Chatbot public endpoint
app.post('/api/chatbot/ask', async (req: Request, res: Response) => {
  try {
    const { session_id, message, use_thinking } = req.body;
    const sessionId = session_id || `ses-anon-${Date.now()}`;
    const result = await askOasisChatbot(sessionId, message, Boolean(use_thinking));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error processing chatbot query.' });
  }
});

app.get('/api/chatbot/logs', (req: Request, res: Response) => {
  res.json(db.getChatbotLogs());
});

// ----------------- AI ASSISTANT ENDPOINTS -----------------
app.post('/api/ai/variations', async (req: Request, res: Response) => {
  try {
    const { title, message, platform, task, use_thinking } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const result = await generateContentVariations(
      title,
      message || '',
      platform || 'Instagram',
      task || 'variations',
      Boolean(use_thinking)
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error generating AI suggestions.' });
  }
});

app.post('/api/ai/monthly-summary', async (req: Request, res: Response) => {
  try {
    const { use_thinking } = req.body;
    const analytics = db.getAnalyticsPlatform();
    const adSpend = db.getAdSpend();
    const recentPosts = db.getContentItems().slice(0, 5);

    const payload = {
      analytics_by_platform: analytics,
      ad_spend_rm: adSpend,
      recent_content: recentPosts.map((p) => ({ title: p.title, format: p.format, status: p.status })),
    };

    const result = await generateMonthlySummary(payload, Boolean(use_thinking));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error generating monthly executive summary.' });
  }
});

// ----------------- RAW CONTENT VAULT -----------------
app.get('/api/raw-content', (req: Request, res: Response) => {
  res.json(db.getRawContent());
});

app.post('/api/raw-content', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { title, link, category, tags, file_type, notes } = req.body;

  if (!title || !link) {
    return res.status(400).json({ error: 'Title and link URL are required.' });
  }

  const created = db.createRawContent({
    title,
    link,
    category: category || 'Program Photos',
    tags: Array.isArray(tags) ? tags : [],
    file_type: file_type || 'drive',
    notes: notes || '',
    created_by: currentUser.id,
  });

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Add Raw Content',
    `Added raw footage link: "${created.title}".`
  );

  res.status(201).json(created);
});

app.put('/api/raw-content/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { id } = req.params;
  const { title, link, category, tags, file_type, notes } = req.body;

  const updated = db.updateRawContent(id, {
    title,
    link,
    category,
    tags,
    file_type,
    notes,
  });

  if (!updated) return res.status(404).json({ error: 'Raw content item not found.' });

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Update Raw Content',
    `Updated raw media: "${updated.title}".`
  );

  res.json(updated);
});

app.delete('/api/raw-content/:id', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  const { id } = req.params;
  const success = db.deleteRawContent(id);

  if (!success) return res.status(404).json({ error: 'Raw content item not found.' });

  db.logActivity(
    currentUser.id,
    currentUser.full_name,
    'Delete Raw Content',
    `Deleted raw content item #${id}.`
  );

  res.json({ success: true });
});

// ----------------- ACTIVITY LOGS & SETTINGS -----------------
app.get('/api/activity-logs', (req: Request, res: Response) => {
  res.json(db.getActivityLogs());
});

app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req: Request, res: Response) => {
  const currentUser = getCurrentUser(req);
  if (currentUser.role !== 'owner') {
    return res.status(403).json({ error: 'Only the Owner is authorized to update system settings.' });
  }

  const updated = db.updateSettings(req.body);
  db.logActivity(currentUser.id, currentUser.full_name, 'Update Settings', 'Updated CMS configuration settings.');
  res.json(updated);
});

// Reset dummy database to default
app.post('/api/db/reset', (req: Request, res: Response) => {
  const state = db.resetToDefault();
  res.json({ success: true, message: 'Database successfully reset to initial default data.' });
});

// ----------------- VITE MIDDLEWARE (DEV) / STATIC (PROD) -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Al Amin Edu Oasis CMS server running on http://localhost:${PORT}`);
  });
}

startServer();
