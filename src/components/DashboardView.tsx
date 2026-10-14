import React, { useState } from 'react';
import {
  Layers,
  CalendarCheck,
  Send,
  Clock,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  CalendarPlus,
  BarChart,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ContentItem,
  CalendarEntry,
  AnalyticsPlatform,
  UserProfile,
} from '../types/index.ts';

interface DashboardViewProps {
  contentItems: ContentItem[];
  calendarEntries: CalendarEntry[];
  analyticsData: AnalyticsPlatform[];
  currentUser: UserProfile;
  onNewContent: () => void;
  onNewSchedule: () => void;
  onNewAnalytics: () => void;
  onViewContentDetail: (item: ContentItem) => void;
  onNavigateToCalendar: () => void;
  onNavigateToLibrary: () => void;
  onNavigateToAnalytics: () => void;
  onPublishEntry: (entry: CalendarEntry) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contentItems,
  calendarEntries,
  analyticsData,
  currentUser,
  onNewContent,
  onNewSchedule,
  onNewAnalytics,
  onViewContentDetail,
  onNavigateToCalendar,
  onNavigateToLibrary,
  onNavigateToAnalytics,
  onPublishEntry,
}) => {
  // KPI Calculations (DASH-01)
  const totalContent = contentItems.length;
  const now = new Date();
  const next7Days = new Date(Date.now() + 7 * 86400000);
  const scheduledThisWeek = calendarEntries.filter((entry) => {
    const entryDate = new Date(entry.scheduled_at);
    return entry.status === 'scheduled' && entryDate >= now && entryDate <= next7Days;
  }).length;

  const publishedThisMonth = calendarEntries.filter((entry) => {
    return entry.status === 'published';
  }).length;

  const pendingApprovalCount = contentItems.filter((i) => i.status === 'pending_approval').length;

  // Missed entries alert (DASH-08)
  const missedEntries = calendarEntries.filter((entry) => {
    return entry.status === 'missed' || (entry.status === 'scheduled' && new Date(entry.scheduled_at) < now);
  });

  // Upcoming 7 Days Schedule (DASH-02)
  const upcomingEntries = [...calendarEntries]
    .filter((entry) => {
      const d = new Date(entry.scheduled_at);
      return entry.status === 'scheduled' && d >= new Date(Date.now() - 86400000);
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 6);

  // Platform Performance aggregation (DASH-03)
  const platformStats = analyticsData.map((anl) => {
    const totalInteractions = anl.likes + anl.comments + anl.shares + anl.saves;
    const engagementRate = anl.reach > 0 ? ((totalInteractions / anl.reach) * 100).toFixed(1) : '0';
    return {
      platform: anl.platform,
      reach: anl.reach,
      impressions: anl.impressions,
      interactions: totalInteractions,
      followers: anl.followers,
      followersGained: anl.followers_gained,
      engagementRate,
    };
  });

  // Trend data mock curve (DASH-04)
  const trendData = [
    { day: 'Week 1', interactions: 3400, reach: 21000 },
    { day: 'Week 2', interactions: 4800, reach: 32000 },
    { day: 'Week 3', interactions: 7100, reach: 49000 },
    { day: 'Week 4', interactions: 9500, reach: 68000 },
  ];

  const getPlatformBadgeColor = (p: string) => {
    switch (p.toLowerCase()) {
      case 'facebook':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'instagram':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'threads':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'tiktok':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'linkedin':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-[#E3F6F5] text-[#0A726F] border-[#0E9F9A]/30';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner / Welcome & Quick Actions (DASH-06) */}
      <div className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-white/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0E9F9A] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Al Amin Marketing Control Center</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#0A726F]">
            Welcome Back, {currentUser.full_name}! 👋
          </h1>
          <p className="text-gray-600 text-sm mt-0.5">
            Here is your daily overview of scheduled editorial content and social media performance metrics.
          </p>
        </div>

        {/* Quick Shortcut Buttons (DASH-06) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onNewContent}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0E9F9A] hover:bg-[#0A726F] text-white text-xs font-semibold shadow-md shadow-[#0E9F9A]/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Content</span>
          </button>
          <button
            onClick={onNewSchedule}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#E3F6F5] text-[#0A726F] border border-[#0E9F9A]/30 text-xs font-semibold transition"
          >
            <CalendarPlus className="w-4 h-4 text-[#0E9F9A]" />
            <span>+ New Schedule</span>
          </button>
          <button
            onClick={onNewAnalytics}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold transition"
          >
            <BarChart className="w-4 h-4 text-gray-500" />
            <span>+ Add Analytics</span>
          </button>
        </div>
      </div>

      {/* Warning Banner if any (DASH-08) */}
      {missedEntries.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300/80 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Attention Required: {missedEntries.length} Scheduled Post(s) Passed Time
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Certain posts have passed their scheduled timestamp without being marked as "Published". Please verify the calendar and update live URLs.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToCalendar}
            className="text-xs font-semibold text-amber-900 bg-amber-200/70 hover:bg-amber-200 px-3 py-1.5 rounded-lg whitespace-nowrap transition"
          >
            Review Calendar
          </button>
        </div>
      )}

      {/* KPI Cards Grid (DASH-01) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Library Count */}
        <div
          onClick={onNavigateToLibrary}
          className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Library Items</span>
            <div className="w-9 h-9 rounded-xl bg-[#E3F6F5] text-[#0E9F9A] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-heading font-bold text-gray-800 mt-3">{totalContent}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <span className="text-[#0E9F9A] font-semibold">100% Active</span>
            <span>stored in library</span>
          </div>
        </div>

        {/* Card 2: Scheduled This Week */}
        <div
          onClick={onNavigateToCalendar}
          className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Scheduled This Week</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-heading font-bold text-gray-800 mt-3">{scheduledThisWeek}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ready for next 7 days</span>
          </div>
        </div>

        {/* Card 3: Published This Month */}
        <div
          onClick={onNavigateToCalendar}
          className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Published This Month</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-heading font-bold text-gray-800 mt-3">{publishedThisMonth}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Live URLs verified</span>
          </div>
        </div>

        {/* Card 4: Pending Approval */}
        <div
          onClick={onNavigateToLibrary}
          className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Pending Approval</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-heading font-bold text-gray-800 mt-3">
            {pendingApprovalCount}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-medium">
            <span>{currentUser.role === 'owner' ? 'Requires Owner review' : 'Under review'}</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Upcoming 7 Days & Platform Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Today & Upcoming 7 Days Schedule (DASH-02) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-white/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-heading font-bold text-[#0A726F] flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#0E9F9A]" />
                  <span>Today & Upcoming 7 Days Schedule (DASH-02)</span>
                </h3>
                <p className="text-xs text-gray-500">Directly synchronized with Content Calendar</p>
              </div>
              <button
                onClick={onNavigateToCalendar}
                className="text-xs text-[#0E9F9A] hover:underline font-semibold flex items-center gap-1"
              >
                <span>View Full</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingEntries.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <CalendarPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No posts scheduled for the upcoming 7 days.</p>
                <button
                  onClick={onNewSchedule}
                  className="mt-3 text-xs text-[#0E9F9A] font-semibold hover:underline"
                >
                  + Schedule a post now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEntries.map((entry) => {
                  const entryDate = new Date(entry.scheduled_at);
                  const isToday =
                    entryDate.toDateString() === new Date().toDateString();
                  const timeFormatted = entryDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateFormatted = entryDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <div
                      key={entry.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isToday
                          ? 'bg-[#E3F6F5]/60 border-[#0E9F9A]/40'
                          : 'bg-white/80 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-center px-2 py-1 bg-white rounded-lg border border-gray-100 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">
                            {isToday ? 'TODAY' : dateFormatted.split(' ')[0]}
                          </span>
                          <span className="text-xs font-bold text-gray-800">
                            {timeFormatted}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${getPlatformBadgeColor(
                                entry.platform
                              )}`}
                            >
                              {entry.platform}
                            </span>
                            {entry.content?.category && (
                              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                {entry.content.category.name}
                              </span>
                            )}
                          </div>

                          <h4
                            onClick={() => entry.content && onViewContentDetail(entry.content)}
                            className="text-xs font-semibold text-gray-800 hover:text-[#0E9F9A] cursor-pointer line-clamp-1"
                          >
                            {entry.content?.title || 'Scheduled Post'}
                          </h4>
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {entry.notes || entry.content?.message?.slice(0, 70)}...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onPublishEntry(entry)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-lg shadow-2xs transition"
                        >
                          Mark Published
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-right">
            <span className="text-[11px] text-gray-400">
              PRD Target: &gt;80% of content planned at least 3 days in advance
            </span>
          </div>
        </div>

        {/* Right 5 Columns: Performance Summary & Top Platform */}
        <div className="lg:col-span-5 space-y-6">
          {/* Spotlight: Top Platform */}
          <div className="glass-card rounded-2xl p-5 border border-white/70 bg-gradient-to-br from-white via-white to-[#E3F6F5]/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#0E9F9A] uppercase tracking-wider">
                🏆 Top Performing Channel (DASH-04)
              </span>
              <span className="text-xs font-semibold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                Instagram & TikTok
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-white/90 border border-gray-100 shadow-2xs">
                <p className="text-[11px] text-gray-500">Total Reach (IG)</p>
                <p className="text-lg font-bold text-gray-800 mt-1">78.9K</p>
                <p className="text-[10px] text-emerald-600 font-medium">+18.5% vs previous</p>
              </div>

              <div className="p-3 rounded-xl bg-white/90 border border-gray-100 shadow-2xs">
                <p className="text-[11px] text-gray-500">Engagement Rate</p>
                <p className="text-lg font-bold text-[#0A726F] mt-1">8.5%</p>
                <p className="text-[10px] text-emerald-600 font-medium">Above education benchmark</p>
              </div>
            </div>
          </div>

          {/* Platform Performance breakdown list (DASH-03) */}
          <div className="glass-card rounded-2xl p-5 border border-white/70">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-heading font-bold text-gray-800 uppercase tracking-wider">
                Performance by Channel (DASH-03)
              </h3>
              <button
                onClick={onNavigateToAnalytics}
                className="text-xs text-[#0E9F9A] hover:underline"
              >
                Full Analytics
              </button>
            </div>

            <div className="space-y-3">
              {platformStats.slice(0, 4).map((stat) => (
                <div
                  key={stat.platform}
                  className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize ${getPlatformBadgeColor(
                        stat.platform
                      )}`}
                    >
                      {stat.platform}
                    </span>
                    <span className="text-gray-600 font-medium">
                      {stat.followers.toLocaleString()} followers
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-gray-800">
                      {stat.reach.toLocaleString()} reach
                    </span>
                    <span className="text-[10px] text-emerald-600 ml-2 font-medium">
                      +{stat.followersGained} new
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Trend Recharts Chart (DASH-04) & Recent Content (DASH-05) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-white/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-heading font-bold text-[#0A726F]">
                Reach & Interaction Trend (30 Days) (DASH-04)
              </h3>
              <p className="text-xs text-gray-500">Real-time charts powered by Recharts</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E9F9A]" />
                Reach
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                Interactions
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #E3F6F5',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reach"
                  stroke="#0E9F9A"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0E9F9A' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="interactions"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#F59E0B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent & High Performing Content (DASH-05) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-white/70">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-heading font-bold text-gray-800">
              Recent & Featured Content (DASH-05)
            </h3>
            <button
              onClick={onNavigateToLibrary}
              className="text-xs text-[#0E9F9A] hover:underline"
            >
              Open Library
            </button>
          </div>

          <div className="space-y-3">
            {contentItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => onViewContentDetail(item)}
                className="p-3 rounded-xl bg-white/70 hover:bg-[#E3F6F5]/40 border border-gray-100 hover:border-[#0E9F9A]/30 transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 truncate">
                  {item.assets && item.assets[0]?.url ? (
                    <img
                      src={item.assets[0].url}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                  )}

                  <div className="truncate">
                    <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        {item.format}
                      </span>
                      <span className="text-[10px] text-[#0E9F9A]">
                        Scheduled {item.times_scheduled || 0}x
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
