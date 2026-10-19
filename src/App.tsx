import React, { useState, useEffect } from 'react';
import { api, getStoredUserId, setStoredUserId } from './services/api.ts';
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
} from './types/index.ts';

import { Header } from './components/Header.tsx';
import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ContentLibraryView } from './components/ContentLibraryView.tsx';
import { RawContentView } from './components/RawContentView.tsx';
import { ContentCalendarView } from './components/ContentCalendarView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { OasisChatWidget } from './components/OasisChatWidget.tsx';
import { testConnection, auth, onAuthStateChanged, logoutFirebase } from './services/firebase.ts';

export default function App() {
  // Current Active User & Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Active Navigation Tab (Section 7.4)
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Application Data Stores
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [rawContent, setRawContent] = useState<RawContentItem[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignEvent[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPlatform[]>([]);
  const [postAnalytics, setPostAnalytics] = useState<AnalyticsPost[]>([]);
  const [adSpends, setAdSpends] = useState<AdSpend[]>([]);
  const [faqs, setFaqs] = useState<ChatbotFAQ[]>([]);
  const [chatbotLogs, setChatbotLogs] = useState<ChatbotLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    require_approval_before_scheduling: true,
    official_whatsapp: 'https://wa.me/60192345678',
    official_whatsapp_number: '+6019-234 5678',
    official_email: 'info@alaminedu.com.my',
    operating_hours: 'Monday - Friday, 8:30 AM - 5:30 PM',
    official_address: 'No 15, Jalan 9/2, Seksyen 9, 43650 Bandar Baru Bangi, Selangor, Malaysia',
    company_name: 'Al Amin Edu Oasis Sdn Bhd',
  });

  // Scheduling Cross-navigation
  const [preselectedContentForCalendar, setPreselectedContentForCalendar] = useState<ContentItem | null>(null);

  // Load All System Data from Backend Dummy Database
  const loadAllData = async () => {
    try {
      const [
        profilesData,
        catsData,
        itemsData,
        rawContentData,
        calendarData,
        campaignsData,
        anlPlatformData,
        anlPostsData,
        adsData,
        faqsData,
        logsData,
        actLogsData,
        settingsData,
      ] = await Promise.all([
        api.getProfiles(),
        api.getCategories(),
        api.getContentItems(),
        api.getRawContent(),
        api.getCalendarEntries(),
        api.getCampaigns(),
        api.getAnalyticsPlatform(),
        api.getAnalyticsPosts(),
        api.getAdSpend(),
        api.getFAQs(),
        api.getChatbotLogs(),
        api.getActivityLogs(),
        api.getSettings(),
      ]);

      setAllUsers(profilesData);
      setCategories(catsData);
      setContentItems(itemsData);
      setRawContent(rawContentData);
      setCalendarEntries(calendarData);
      setCampaigns(campaignsData);
      setAnalyticsData(anlPlatformData);
      setPostAnalytics(anlPostsData);
      setAdSpends(adsData);
      setFaqs(faqsData);
      setChatbotLogs(logsData);
      setActivityLogs(actLogsData);
      setSettings(settingsData);

      // Determine active user
      const storedId = getStoredUserId();
      const matched = profilesData.find((p) => p.id === storedId) || profilesData[0];
      setCurrentUser(matched);
    } catch (err) {
      console.error('Error fetching initial CMS data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadAllData();
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        console.log('Firebase user active:', fbUser.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setStoredUserId(user.id);
    setIsLoggedOut(false);
  };

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    setStoredUserId(user.id);
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn('Firebase logout warning:', e);
    }
    setIsLoggedOut(true);
  };

  const handleResetDatabase = async () => {
    if (confirm('Are you sure you want to reset all data back to the default seed state?')) {
      await api.resetDatabase();
      await loadAllData();
      alert('The database has been successfully reset to a clean state!');
    }
  };

  // Content Operations (LIB)
  const handleCreateContent = async (payload: any) => {
    await api.createContentItem(payload);
    await loadAllData();
  };

  const handleUpdateContent = async (id: string, payload: any) => {
    await api.updateContentItem(id, payload);
    await loadAllData();
  };

  const handleDuplicateContent = async (id: string) => {
    await api.duplicateContentItem(id);
    await loadAllData();
  };

  const handleDeleteContent = async (id: string) => {
    await api.deleteContentItem(id);
    await loadAllData();
  };

  const handleBulkContentAction = async (ids: string[], action: any, value: string) => {
    await api.bulkContentAction(ids, action, value);
    await loadAllData();
  };

  // Cross-Navigation: Direct Schedule from Library (LIB-06)
  const handleScheduleFromLibrary = (item: ContentItem) => {
    setPreselectedContentForCalendar(item);
    setCurrentTab('calendar');
  };

  // Calendar Operations (CAL)
  const handleCreateCalendarEntry = async (entry: any) => {
    await api.createCalendarEntry(entry);
    await loadAllData();
  };

  const handleUpdateCalendarEntry = async (id: string, updates: any) => {
    await api.updateCalendarEntry(id, updates);
    await loadAllData();
  };

  const handleDeleteCalendarEntry = async (id: string) => {
    await api.deleteCalendarEntry(id);
    await loadAllData();
  };

  const handleCreateCampaign = async (campaign: any) => {
    await api.createCampaign(campaign);
    await loadAllData();
  };

  const handleDeleteCampaign = async (id: string) => {
    await api.deleteCampaign(id);
    await loadAllData();
  };

  // Analytics Operations (RPT)
  const handleCreatePlatformData = async (data: any) => {
    await api.createAnalyticsPlatform(data);
    await loadAllData();
  };

  const handleImportCsv = async (rows: any[]) => {
    await api.importAnalyticsCsv(rows);
    await loadAllData();
  };

  const handleCreateAdSpend = async (data: any) => {
    await api.createAdSpend(data);
    await loadAllData();
  };

  // Raw Content Vault Operations (Requirement #4)
  const handleCreateRawContent = async (data: any) => {
    await api.createRawContent(data);
    await loadAllData();
  };

  const handleUpdateRawContent = async (id: string, updates: any) => {
    await api.updateRawContent(id, updates);
    await loadAllData();
  };

  const handleDeleteRawContent = async (id: string) => {
    await api.deleteRawContent(id);
    await loadAllData();
  };

  const handleSendRawToLibrary = (item: RawContentItem) => {
    setCurrentTab('library');
  };

  // Settings & Staff Management
  const handleUpdateSettings = async (updates: Partial<SystemSettings>) => {
    await api.updateSettings(updates);
    await loadAllData();
  };

  const handleInviteUser = async (data: any) => {
    await api.inviteProfile(data);
    await loadAllData();
  };

  const handleUpdateUserRole = async (id: string, updates: Partial<UserProfile>) => {
    await api.updateProfile(id, updates);
    await loadAllData();
  };

  // AI Assistance Calling Methods (LIB-10, RPT-07)
  const handleCallAiVariation = async (
    title: string,
    message: string,
    platform: string,
    task: any,
    useThinking?: boolean
  ): Promise<string> => {
    const res = await api.getAiVariations({
      title,
      message,
      platform,
      task,
      use_thinking: useThinking,
    });
    return res.text;
  };

  const handleGenerateAiSummary = async (useThinking?: boolean): Promise<string> => {
    const res = await api.getAiMonthlySummary(useThinking);
    return res.text;
  };

  const handleAskChatbot = async (
    sessionId: string,
    message: string,
    useThinking?: boolean
  ) => {
    const res = await api.askChatbot(sessionId, message, useThinking);
    // Refresh logs in background
    api.getChatbotLogs().then(setChatbotLogs).catch(() => {});
    return res;
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#F5F8F8] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0E9F9A] to-[#0A726F] flex items-center justify-center text-white animate-spin">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="30" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-[#0A726F] tracking-wide">
          Loading Al Amin Edu Oasis CMS...
        </p>
      </div>
    );
  }

  // If user is logged out, show Login modal
  if (isLoggedOut || !currentUser) {
    return (
      <LoginModal
        availableUsers={allUsers}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const pendingApprovalsCount = contentItems.filter((i) => i.status === 'pending_approval').length;
  const missedCount = calendarEntries.filter((e) => e.status === 'missed').length;

  return (
    <div className="min-h-screen flex bg-[#F5F8F8] text-[#1F2A2A]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        pendingApprovalsCount={pendingApprovalsCount}
        rawContentCount={rawContent.length}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Top Header Bar */}
        <Header
          currentUser={currentUser}
          allUsers={allUsers}
          onSwitchUser={handleSwitchUser}
          onLogout={handleLogout}
          onResetDb={handleResetDatabase}
          pendingApprovalCount={pendingApprovalsCount}
          missedEntriesCount={missedCount}
          onOpenPendingApprovals={() => setCurrentTab('library')}
          onOpenMissedEntries={() => setCurrentTab('calendar')}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              contentItems={contentItems}
              calendarEntries={calendarEntries}
              analyticsData={analyticsData}
              currentUser={currentUser}
              onNewContent={() => setCurrentTab('library')}
              onNewSchedule={() => setCurrentTab('calendar')}
              onNewAnalytics={() => setCurrentTab('analytics')}
              onViewContentDetail={() => setCurrentTab('library')}
              onNavigateToCalendar={() => setCurrentTab('calendar')}
              onNavigateToLibrary={() => setCurrentTab('library')}
              onNavigateToAnalytics={() => setCurrentTab('analytics')}
              onPublishEntry={(entry) => {
                setPreselectedContentForCalendar(entry.content || null);
                setCurrentTab('calendar');
              }}
            />
          )}

          {currentTab === 'library' && (
            <ContentLibraryView
              items={contentItems}
              categories={categories}
              currentUser={currentUser}
              onCreateItem={handleCreateContent}
              onUpdateItem={handleUpdateContent}
              onDuplicateItem={handleDuplicateContent}
              onDeleteItem={handleDeleteContent}
              onBulkAction={handleBulkContentAction}
              onScheduleItem={handleScheduleFromLibrary}
              onCallAi={handleCallAiVariation}
            />
          )}

          {currentTab === 'raw_content' && (
            <RawContentView
              items={rawContent}
              currentUser={currentUser}
              onCreateItem={handleCreateRawContent}
              onUpdateItem={handleUpdateRawContent}
              onDeleteItem={handleDeleteRawContent}
              onSendToLibrary={handleSendRawToLibrary}
            />
          )}

          {currentTab === 'calendar' && (
            <ContentCalendarView
              entries={calendarEntries}
              contentItems={contentItems}
              campaigns={campaigns}
              users={allUsers}
              currentUser={currentUser}
              onCreateEntry={handleCreateCalendarEntry}
              onUpdateEntry={handleUpdateCalendarEntry}
              onDeleteEntry={handleDeleteCalendarEntry}
              onCreateCampaign={handleCreateCampaign}
              onDeleteCampaign={handleDeleteCampaign}
              preselectedContent={preselectedContentForCalendar}
              onClearPreselectedContent={() => setPreselectedContentForCalendar(null)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              analyticsData={analyticsData}
              postAnalytics={postAnalytics}
              adSpends={adSpends}
              contentItems={contentItems}
              currentUser={currentUser}
              onCreatePlatformData={handleCreatePlatformData}
              onImportCsv={handleImportCsv}
              onCreateAdSpend={handleCreateAdSpend}
              onGenerateAiSummary={handleGenerateAiSummary}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              allUsers={allUsers}
              settings={settings}
              activityLogs={activityLogs}
              onUpdateSettings={handleUpdateSettings}
              onInviteUser={handleInviteUser}
              onUpdateUserRole={handleUpdateUserRole}
              onResetDb={handleResetDatabase}
            />
          )}

          {currentTab === 'public_chatbot' && (
            <div className="space-y-4">
              <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#0A726F]">
                    Public Participant View (Chatbot Preview)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Live interactive preview for prospective parents and students interacting with the Oasis AI Assistant.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer"
                >
                  Return to CMS Dashboard
                </button>
              </div>

              <OasisChatWidget
                settings={settings}
                onAskChatbot={handleAskChatbot}
                standaloneMode={true}
              />
            </div>
          )}
        </main>
      </div>

      {/* Floating Chatbot Widget for all CMS pages except public_chatbot */}
      {currentTab !== 'public_chatbot' && (
        <OasisChatWidget
          settings={settings}
          onAskChatbot={handleAskChatbot}
          standaloneMode={false}
        />
      )}
    </div>
  );
}
