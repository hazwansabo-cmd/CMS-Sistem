import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  Printer,
  Search,
  ExternalLink,
  Layers,
  CheckCircle2,
  X,
  Tag,
  Trash2,
} from 'lucide-react';
import {
  CalendarEntry,
  ContentItem,
  CampaignEvent,
  UserProfile,
  SocialPlatform,
  CalendarStatus,
} from '../types/index.ts';

interface ContentCalendarViewProps {
  entries: CalendarEntry[];
  contentItems: ContentItem[];
  campaigns: CampaignEvent[];
  users: UserProfile[];
  currentUser: UserProfile;
  onCreateEntry: (entry: any) => Promise<void>;
  onUpdateEntry: (id: string, entry: any) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onCreateCampaign: (campaign: any) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  preselectedContent?: ContentItem | null;
  onClearPreselectedContent?: () => void;
}

export const ContentCalendarView: React.FC<ContentCalendarViewProps> = ({
  entries,
  contentItems,
  campaigns,
  users,
  currentUser,
  onCreateEntry,
  onUpdateEntry,
  onDeleteEntry,
  onCreateCampaign,
  onDeleteCampaign,
  preselectedContent,
  onClearPreselectedContent,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filters (CAL-05)
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStaff, setFilterStaff] = useState<string>('all');

  // Side Drawer: Select from Library (CAL-06)
  const [showLibraryDrawer, setShowLibraryDrawer] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(Boolean(preselectedContent));
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [publishUrlInput, setPublishUrlInput] = useState('');

  // Campaign modal state (CAL-08)
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignStart, setCampaignStart] = useState('');
  const [campaignEnd, setCampaignEnd] = useState('');
  const [campaignColor, setCampaignColor] = useState('#0E9F9A');

  // Form for New Schedule
  const [selectedContentId, setSelectedContentId] = useState<string>(
    preselectedContent?.id || contentItems[0]?.id || ''
  );
  const [schedulePlatforms, setSchedulePlatforms] = useState<SocialPlatform[]>(['instagram', 'facebook']);
  const [scheduleDate, setScheduleDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [assignedStaffId, setAssignedStaffId] = useState<string>(currentUser.id);
  const [scheduleNotes, setScheduleNotes] = useState<string>('');

  React.useEffect(() => {
    if (preselectedContent) {
      setSelectedContentId(preselectedContent.id);
      if (preselectedContent.platforms && preselectedContent.platforms.length > 0) {
        setSchedulePlatforms(preselectedContent.platforms.map((p) => p.platform));
      }
      setScheduleModalOpen(true);
    }
  }, [preselectedContent]);

  // Navigate dates
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    if (filterPlatform !== 'all' && e.platform !== filterPlatform) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (filterStaff !== 'all' && e.assigned_to !== filterStaff) return false;
    return true;
  });

  const getPlatformColor = (p: SocialPlatform) => {
    switch (p) {
      case 'facebook':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'instagram':
        return 'bg-pink-100 text-pink-900 border-pink-300';
      case 'threads':
        return 'bg-neutral-800 text-white border-neutral-900';
      case 'tiktok':
        return 'bg-cyan-100 text-cyan-900 border-cyan-400';
      case 'linkedin':
        return 'bg-sky-100 text-sky-900 border-sky-400';
      case 'website':
        return 'bg-[#E3F6F5] text-[#0A726F] border-[#0E9F9A]';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadge = (status: CalendarStatus) => {
    switch (status) {
      case 'published':
        return 'bg-[#2E9E5B] text-white';
      case 'missed':
        return 'bg-[#E5484D] text-white';
      case 'cancelled':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-[#0E9F9A] text-white';
    }
  };

  const checkOverlapAlert = (dateStr: string, platform: string) => {
    const sameDayPlatform = filteredEntries.filter((e) => {
      const eDateStr = new Date(e.scheduled_at).toISOString().split('T')[0];
      return eDateStr === dateStr && e.platform === platform;
    });
    return sameDayPlatform.length > 1;
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentId || !scheduleDate) {
      alert('Please select content and publication date.');
      return;
    }
    if (schedulePlatforms.length === 0) {
      alert('Please tick at least one platform to publish to.');
      return;
    }

    const scheduledAt = new Date(`${scheduleDate}T10:00:00`).toISOString();
    await onCreateEntry({
      content_id: selectedContentId,
      platforms: schedulePlatforms,
      platform: schedulePlatforms[0],
      scheduled_at: scheduledAt,
      assigned_to: assignedStaffId,
      status: 'scheduled',
      notes: scheduleNotes,
    });

    setScheduleModalOpen(false);
    if (onClearPreselectedContent) onClearPreselectedContent();
  };

  const handleConfirmPublish = async () => {
    if (!selectedEntry) return;
    await onUpdateEntry(selectedEntry.id, {
      status: 'published',
      published_url: publishUrlInput || 'https://instagram.com/alamineduoasis',
    });
    setPublishModalOpen(false);
    setSelectedEntry(null);
    setPublishUrlInput('');
  };

  const handleRescheduleDate = async (entry: CalendarEntry, daysOffset: number) => {
    const currentDt = new Date(entry.scheduled_at);
    currentDt.setDate(currentDt.getDate() + daysOffset);
    await onUpdateEntry(entry.id, {
      scheduled_at: currentDt.toISOString(),
    });
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle || !campaignStart || !campaignEnd) return;
    await onCreateCampaign({
      title: campaignTitle,
      start_date: campaignStart,
      end_date: campaignEnd,
      color: campaignColor,
    });
    setCampaignModalOpen(false);
    setCampaignTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Header Bar & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0A726F]">
            Editorial Social Media Calendar (CAL-01)
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Coordinate publishing dates, monitor live post status, and align school campaign banners.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Drawer Toggle: Select from Library (CAL-06) */}
          <button
            onClick={() => setShowLibraryDrawer(!showLibraryDrawer)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-[#0E9F9A]/30 text-[#0A726F] text-xs font-semibold shadow-2xs transition"
          >
            <Layers className="w-3.5 h-3.5 text-[#0E9F9A]" />
            <span>Select from Library (CAL-06)</span>
          </button>

          {/* Add Campaign Event Button (CAL-08) */}
          {currentUser.role === 'owner' && (
            <button
              onClick={() => setCampaignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E3F6F5] hover:bg-[#cdeeed] border border-[#0E9F9A]/30 text-[#0A726F] text-xs font-semibold transition"
            >
              <Tag className="w-3.5 h-3.5 text-[#0E9F9A]" />
              <span>+ Campaign / Holiday (CAL-08)</span>
            </button>
          )}

          {/* Print/Export PDF Button (CAL-11) */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold shadow-2xs transition"
            title="Print monthly calendar for team meetings"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* New Schedule Button */}
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E9F9A] hover:bg-[#0A726F] text-white text-xs font-semibold shadow-md shadow-[#0E9F9A]/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Schedule Entry</span>
          </button>
        </div>
      </div>

      {/* Calendar Navigation & Filters Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Month/Week Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h2 className="text-base font-heading font-bold text-gray-800 min-w-[170px] text-center">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            Today
          </button>
        </div>

        {/* View Switcher (Month, Week, Agenda) (CAL-01) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'month' ? 'bg-white text-[#0E9F9A] font-bold shadow-xs' : 'text-gray-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'week' ? 'bg-white text-[#0E9F9A] font-bold shadow-xs' : 'text-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-lg transition ${
                viewMode === 'agenda' ? 'bg-white text-[#0E9F9A] font-bold shadow-xs' : 'text-gray-600'
              }`}
            >
              List / Agenda
            </button>
          </div>

          {/* Quick Filters (CAL-05) */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none text-gray-700"
          >
            <option value="all">All Channels</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="threads">Threads</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>

      {/* Campaign Events Banners Strips (CAL-08) */}
      {campaigns.length > 0 && (
        <div className="p-3 glass-card rounded-2xl border border-white/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
            <span className="flex items-center gap-1.5 text-[#0A726F]">
              <Tag className="w-3.5 h-3.5 text-[#0E9F9A]" />
              <span>Active Institutional Campaigns & Important Dates (CAL-08):</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {campaigns.map((cmp) => (
              <div
                key={cmp.id}
                className="px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-2 text-white shadow-2xs"
                style={{ backgroundColor: cmp.color || '#0E9F9A' }}
              >
                <span>{cmp.title}</span>
                <span className="text-[10px] opacity-80">
                  ({new Date(cmp.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} -{' '}
                  {new Date(cmp.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })})
                </span>
                {currentUser.role === 'owner' && (
                  <button
                    onClick={() => onDeleteCampaign(cmp.id)}
                    className="hover:opacity-75 ml-1 text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout with Side Panel (CAL-06) */}
      <div className="flex gap-6 items-start">
        {/* Main Calendar View Area */}
        <div className="flex-1 glass-card rounded-2xl overflow-hidden border border-white/70 shadow-sm">
          {viewMode === 'month' && (
            <div className="divide-y divide-gray-200">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 bg-gray-50/90 text-center text-xs font-bold text-gray-600 py-2.5">
                <span>Sunday</span>
                <span>Monday</span>
                <span>Tuesday</span>
                <span>Wednesday</span>
                <span>Thursday</span>
                <span>Friday</span>
                <span>Saturday</span>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-gray-100 min-h-[560px]">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-gray-50/40 p-2 min-h-[105px]" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayDate = new Date(year, month, dayNum);
                  const dateStr = dayDate.toISOString().split('T')[0];
                  const isToday = dayDate.toDateString() === new Date().toDateString();

                  const dayEntries = filteredEntries.filter((e) => {
                    const eDateStr = new Date(e.scheduled_at).toISOString().split('T')[0];
                    return eDateStr === dateStr;
                  });

                  const hasOverlapFB = checkOverlapAlert(dateStr, 'facebook');
                  const hasOverlapIG = checkOverlapAlert(dateStr, 'instagram');

                  return (
                    <div
                      key={dayNum}
                      className={`p-1.5 md:p-2 min-h-[110px] border-b border-gray-100 flex flex-col justify-between transition group hover:bg-emerald-50/20 ${
                        isToday ? 'bg-[#E3F6F5]/40' : 'bg-white/60'
                      }`}
                    >
                      <div>
                        {/* Day Number and Alerts */}
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                              isToday
                                ? 'bg-[#0E9F9A] text-white shadow-xs'
                                : 'text-gray-700'
                            }`}
                          >
                            {dayNum}
                          </span>

                          {(hasOverlapFB || hasOverlapIG) && (
                            <span
                              title="Overlap Warning: Multiple posts scheduled on the same platform today (CAL-09)"
                              className="text-[10px] px-1 py-0.2 bg-red-100 text-red-700 rounded flex items-center gap-0.5"
                            >
                              <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                            </span>
                          )}
                        </div>

                        {/* List of Entries on this day */}
                        <div className="space-y-1">
                          {dayEntries.slice(0, 3).map((entry) => (
                            <div
                              key={entry.id}
                              onClick={() => {
                                setSelectedEntry(entry);
                                setPublishUrlInput(entry.published_url || '');
                                setPublishModalOpen(true);
                              }}
                              className={`p-1.5 rounded-lg border text-[11px] leading-tight cursor-pointer transition shadow-2xs hover:shadow-xs group/entry ${getPlatformColor(
                                entry.platform
                              )}`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="font-bold uppercase text-[9px]">
                                  {entry.platform.slice(0, 4)}
                                </span>
                                <span
                                  className={`text-[8px] px-1 rounded-sm uppercase font-bold ${getStatusBadge(
                                    entry.status
                                  )}`}
                                >
                                  {entry.status.slice(0, 3)}
                                </span>
                              </div>
                              <p className="line-clamp-1 font-semibold text-gray-800">
                                {entry.content?.title || 'Scheduled Post'}
                              </p>
                              <p className="text-[9px] text-gray-500">
                                {new Date(entry.scheduled_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>

                              {/* Quick Move / Shift Controls (CAL-03) */}
                              <div className="hidden group-hover/entry:flex items-center justify-between pt-1 border-t border-black/10 mt-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRescheduleDate(entry, -1);
                                  }}
                                  className="text-[9px] hover:font-bold"
                                  title="Shift to previous day"
                                >
                                  ←
                                </button>
                                <span className="text-[8px] opacity-75">Shift</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRescheduleDate(entry, 1);
                                  }}
                                  className="text-[9px] hover:font-bold"
                                  title="Shift to next day"
                                >
                                  →
                                </button>
                              </div>
                            </div>
                          ))}

                          {dayEntries.length > 3 && (
                            <span className="text-[10px] text-gray-400 block text-center font-medium">
                              +{dayEntries.length - 3} more posts
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick + Add button on day cell */}
                      <button
                        onClick={() => {
                          setScheduleDate(dateStr);
                          setScheduleModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-[#0E9F9A] font-semibold py-0.5 hover:underline transition text-center"
                      >
                        + Schedule
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Agenda / List View (CAL-01) */}
          {viewMode === 'agenda' && (
            <div className="p-6 divide-y divide-gray-100">
              <h3 className="text-sm font-bold text-[#0A726F] mb-4">
                Monthly Publication Agenda
              </h3>
              {filteredEntries.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">
                  No scheduled entries match the selected filters.
                </p>
              ) : (
                filteredEntries
                  .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-center px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                          <p className="font-bold text-gray-800">
                            {new Date(entry.scheduled_at).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(entry.scheduled_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getPlatformColor(
                                entry.platform
                              )}`}
                            >
                              {entry.platform}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusBadge(
                                entry.status
                              )}`}
                            >
                              {entry.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-gray-800">
                            {entry.content?.title || 'Scheduled Post'}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Assigned to: {entry.assignee?.full_name || 'Al Amin Staff'}
                          </p>
                          {entry.published_url && (
                            <a
                              href={entry.published_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#0E9F9A] hover:underline flex items-center gap-1 mt-1 font-semibold"
                            >
                              <span>Live Link: {entry.published_url}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedEntry(entry);
                            setPublishUrlInput(entry.published_url || '');
                            setPublishModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#0E9F9A] text-white rounded-lg text-xs font-semibold hover:bg-[#0A726F]"
                        >
                          {entry.status === 'published' ? 'Update Live URL' : 'Mark Published'}
                        </button>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Week View (CAL-01) */}
          {viewMode === 'week' && (
            <div className="p-4 overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(currentDate);
                  const dayOffset = i - d.getDay();
                  d.setDate(d.getDate() + dayOffset);
                  const dateStr = d.toISOString().split('T')[0];
                  const dayEntries = filteredEntries.filter(
                    (e) => new Date(e.scheduled_at).toISOString().split('T')[0] === dateStr
                  );

                  return (
                    <div key={i} className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 min-h-[300px]">
                      <div className="text-center pb-2 border-b border-gray-200 mb-2">
                        <p className="text-[11px] text-gray-500 uppercase font-semibold">
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className="text-sm font-bold text-gray-800">{d.getDate()}</p>
                      </div>

                      <div className="space-y-1.5">
                        {dayEntries.map((e) => (
                          <div
                            key={e.id}
                            onClick={() => {
                              setSelectedEntry(e);
                              setPublishModalOpen(true);
                            }}
                            className={`p-2 rounded-lg border text-xs cursor-pointer ${getPlatformColor(
                              e.platform
                            )}`}
                          >
                            <span className="text-[9px] uppercase font-bold block">{e.platform}</span>
                            <span className="font-semibold line-clamp-1">{e.content?.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel: "Select from Library" (CAL-06) */}
        {showLibraryDrawer && (
          <div className="w-80 glass-card rounded-2xl p-4 border border-white/80 shadow-lg flex-shrink-0 animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0E9F9A]" />
                <h3 className="text-xs font-heading font-bold text-gray-800">
                  Content Library (CAL-06)
                </h3>
              </div>
              <button
                onClick={() => setShowLibraryDrawer(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3">
              <div className="relative mb-3">
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="Search content to schedule..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {contentItems
                  .filter((item) =>
                    drawerSearch
                      ? item.title.toLowerCase().includes(drawerSearch.toLowerCase())
                      : true
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white border border-gray-100 hover:border-[#0E9F9A]/40 transition shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold uppercase">
                          {item.format}
                        </span>
                        <span className="text-[10px] text-[#0E9F9A]">
                          {item.times_scheduled || 0}x used
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-gray-800 line-clamp-2">
                        {item.title}
                      </h4>

                      <button
                        onClick={() => {
                          setSelectedContentId(item.id);
                          if (item.platforms && item.platforms.length > 0) {
                            setSchedulePlatforms(item.platforms.map((p) => p.platform));
                          } else {
                            setSchedulePlatforms(['instagram', 'facebook']);
                          }
                          setScheduleModalOpen(true);
                        }}
                        className="w-full py-1 bg-[#E3F6F5] hover:bg-[#0E9F9A] text-[#0A726F] hover:text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        + Insert to Calendar
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create New Schedule Entry (CAL-02) */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-heading font-bold text-[#0A726F]">
                Schedule Content (CAL-02)
              </h3>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Content Item from Library
                </label>
                <select
                  required
                  value={selectedContentId}
                  onChange={(e) => setSelectedContentId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                >
                  {contentItems.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.format})
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Platform Tick Options (Requirement #2) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Target Platforms (Tick one or more)
                  </label>
                  <div className="flex gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setSchedulePlatforms([
                          'instagram',
                          'facebook',
                          'tiktok',
                          'threads',
                          'linkedin',
                          'website',
                        ])
                      }
                      className="text-[#0E9F9A] hover:underline font-semibold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSchedulePlatforms([])}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'instagram', label: 'Instagram', color: 'hover:border-pink-300 peer-checked:bg-pink-50 peer-checked:border-pink-500 peer-checked:text-pink-700' },
                      { id: 'facebook', label: 'Facebook', color: 'hover:border-blue-300 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700' },
                      { id: 'tiktok', label: 'TikTok', color: 'hover:border-cyan-300 peer-checked:bg-cyan-50 peer-checked:border-cyan-500 peer-checked:text-cyan-800' },
                      { id: 'threads', label: 'Threads', color: 'hover:border-neutral-400 peer-checked:bg-neutral-100 peer-checked:border-neutral-700 peer-checked:text-neutral-900' },
                      { id: 'linkedin', label: 'LinkedIn', color: 'hover:border-sky-300 peer-checked:bg-sky-50 peer-checked:border-sky-500 peer-checked:text-sky-700' },
                      { id: 'website', label: 'Website / Portal', color: 'hover:border-emerald-300 peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-800' },
                    ] as const
                  ).map((p) => {
                    const isChecked = schedulePlatforms.includes(p.id as SocialPlatform);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-[#E3F6F5] border-[#0E9F9A] text-[#0A726F] font-semibold shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSchedulePlatforms((prev) => [...prev, p.id as SocialPlatform]);
                            } else {
                              setSchedulePlatforms((prev) => prev.filter((item) => item !== p.id));
                            }
                          }}
                          className="w-4 h-4 accent-[#0E9F9A] rounded cursor-pointer"
                        />
                        <span>{p.label}</span>
                      </label>
                    );
                  })}
                </div>
                {schedulePlatforms.length > 1 && (
                  <p className="text-[11px] text-[#0E9F9A] font-medium mt-1.5 flex items-center gap-1">
                    ✓ Will schedule across {schedulePlatforms.length} platforms on this date.
                  </p>
                )}
              </div>

              {/* Date & Assignee Fields (No Time field as requested) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Assignee (Staff)
                  </label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role === 'owner' ? 'Owner' : 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Publishing Notes & Instructions
                </label>
                <textarea
                  rows={2}
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder="e.g. Ensure the bio registration link is active and monitor comments after 30 mins..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Save Schedule Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mark Published & Enter Live URL (CAL-07) */}
      {publishModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-heading font-bold text-[#0A726F]">
                Mark as Published (CAL-07)
              </h3>
              <button
                onClick={() => setPublishModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 bg-[#E3F6F5]/50 rounded-xl border border-[#0E9F9A]/20">
                <span className="text-[10px] font-bold text-[#0A726F] uppercase">
                  {selectedEntry.platform} • {new Date(selectedEntry.scheduled_at).toLocaleDateString('en-US')}
                </span>
                <p className="text-xs font-semibold text-gray-800 mt-1">
                  {selectedEntry.content?.title}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Live Post URL
                </label>
                <input
                  type="url"
                  value={publishUrlInput}
                  onChange={(e) => setPublishUrlInput(e.target.value)}
                  placeholder="https://instagram.com/p/alamin_post_123"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/40"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  This live URL directly links into the Reports & Analytics module.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteEntry(selectedEntry.id);
                    setPublishModalOpen(false);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete Entry
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPublishModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPublish}
                    className="px-4 py-1.5 bg-[#2E9E5B] hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Published</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Campaign Event (CAL-08) */}
      {campaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-heading font-bold text-[#0A726F]">
                Add Campaign / Holiday Event (CAL-08)
              </h3>
              <button
                onClick={() => setCampaignModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event / Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Ramadan Barakah 1448H Campaign"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={campaignStart}
                    onChange={(e) => setCampaignStart(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={campaignEnd}
                    onChange={(e) => setCampaignEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Banner Strip Color
                </label>
                <div className="flex gap-2">
                  {['#0E9F9A', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCampaignColor(c)}
                      className={`w-7 h-7 rounded-full border-2 ${
                        campaignColor === c ? 'border-gray-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCampaignModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-lg text-xs font-semibold"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
