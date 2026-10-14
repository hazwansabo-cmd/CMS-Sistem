import React, { useState } from 'react';
import {
  Search,
  Grid,
  List,
  Plus,
  Copy,
  Trash2,
  Calendar,
  Sparkles,
  Download,
  CheckSquare,
  Square,
  Eye,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Play,
  Image as ImageIcon,
  Layers,
  FileText,
  Edit3,
  X,
  Check,
  BrainCircuit,
} from 'lucide-react';
import {
  ContentItem,
  Category,
  UserProfile,
  SocialPlatform,
  ContentFormat,
  ContentStatus,
} from '../types/index.ts';

interface ContentLibraryViewProps {
  items: ContentItem[];
  categories: Category[];
  currentUser: UserProfile;
  onCreateItem: (data: any) => Promise<void>;
  onUpdateItem: (id: string, data: any) => Promise<void>;
  onDuplicateItem: (id: string) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onBulkAction: (ids: string[], action: 'status' | 'archive' | 'add_tag', value: string) => Promise<void>;
  onScheduleItem: (item: ContentItem) => void;
  onCallAi: (
    title: string,
    message: string,
    platform: string,
    task: 'variations' | 'cta' | 'rewrite',
    useThinking?: boolean
  ) => Promise<string>;
}

export const ContentLibraryView: React.FC<ContentLibraryViewProps> = ({
  items,
  categories,
  currentUser,
  onCreateItem,
  onUpdateItem,
  onDuplicateItem,
  onDeleteItem,
  onBulkAction,
  onScheduleItem,
  onCallAi,
}) => {
  const isOwner = currentUser.role === 'owner';

  // Filters state (LIB-03)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  // Bulk selection (LIB-09)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkTagInput, setBulkTagInput] = useState('');

  // Modals state
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [mockupPlatform, setMockupPlatform] = useState<'instagram' | 'facebook' | 'threads'>('instagram');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  // AI Modal state (LIB-10)
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTask, setAiTask] = useState<'variations' | 'cta' | 'rewrite'>('variations');
  const [aiTargetPlatform, setAiTargetPlatform] = useState<string>('Instagram');
  const [aiUseThinking, setAiUseThinking] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    cta_text: '',
    cta_url: '',
    format: 'poster' as ContentFormat,
    status: 'draft' as ContentStatus,
    category_id: categories[0]?.id || '',
    tags: [] as string[],
    tagInput: '',
    video_url: '',
    platforms: ['facebook', 'instagram'] as SocialPlatform[],
    overridePlatform: 'threads' as SocialPlatform,
    overrideMessage: '',
    assets: [
      {
        url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
        type: 'image' as 'image' | 'video',
        position: 1,
        alt_text: 'Al Amin educational campaign',
      },
    ],
  });

  // Filter items
  const filteredItems = items.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchMsg && !matchTag) return false;
    }
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) return false;
    if (selectedPlatform !== 'all') {
      const hasPlat = item.platforms?.some(
        (p) => p.platform.toLowerCase() === selectedPlatform.toLowerCase()
      );
      if (!hasPlat) return false;
    }
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (selectedFormat !== 'all' && item.format !== selectedFormat) return false;
    return true;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      message: '',
      cta_text: 'Register Now',
      cta_url: 'https://alaminedu.com.my',
      format: 'poster',
      status: 'draft',
      category_id: categories[0]?.id || '',
      tags: ['AlAminEdu', 'IslamicEducation'],
      tagInput: '',
      video_url: '',
      platforms: ['facebook', 'instagram'],
      overridePlatform: 'threads',
      overrideMessage: '',
      assets: [
        {
          url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
          type: 'image',
          position: 1,
          alt_text: 'Al Amin poster',
        },
      ],
    });
    setEditModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    const existingPlatforms = item.platforms?.map((p) => p.platform) || ['facebook'];
    const existingAssets =
      item.assets && item.assets.length > 0
        ? item.assets.map((a) => ({
            url: a.url,
            type: a.type,
            position: a.position,
            alt_text: a.alt_text || '',
          }))
        : [
            {
              url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
              type: 'image' as 'image' | 'video',
              position: 1,
              alt_text: 'Al Amin promo asset',
            },
          ];

    setFormData({
      title: item.title,
      message: item.message,
      cta_text: item.cta_text || '',
      cta_url: item.cta_url || '',
      format: item.format,
      status: item.status,
      category_id: item.category_id,
      tags: [...item.tags],
      tagInput: '',
      video_url: item.video_url || '',
      platforms: existingPlatforms,
      overridePlatform: 'threads',
      overrideMessage: item.platforms?.find((p) => p.message_override)?.message_override || '',
      assets: existingAssets,
    });
    setEditModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in both the title and message.');
      return;
    }

    const platformsPayload = formData.platforms.map((p) => ({
      platform: p,
      message_override: p === formData.overridePlatform ? formData.overrideMessage : undefined,
    }));

    const payload = {
      title: formData.title,
      message: formData.message,
      cta_text: formData.cta_text,
      cta_url: formData.cta_url,
      format: formData.format,
      status: formData.status,
      category_id: formData.category_id,
      tags: formData.tags,
      video_url: formData.video_url,
      platforms: platformsPayload,
      assets: formData.assets,
    };

    if (editingItem) {
      await onUpdateItem(editingItem.id, payload);
    } else {
      await onCreateItem(payload);
    }
    setEditModalOpen(false);
  };

  // Add Carousel Slide
  const handleAddSlide = () => {
    setFormData((prev) => ({
      ...prev,
      assets: [
        ...prev.assets,
        {
          url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
          type: 'image',
          position: prev.assets.length + 1,
          alt_text: `Slide ${prev.assets.length + 1}`,
        },
      ],
    }));
  };

  const handleRemoveSlide = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== idx),
    }));
  };

  // Quick CTA Templates
  const ctaTemplates = [
    { text: 'Register Now & Save 15%', url: 'https://alaminedu.com.my/register' },
    { text: 'Contact Us on WhatsApp', url: 'https://wa.me/60192345678' },
    { text: 'Download Free Math E-Book', url: 'https://alaminedu.com.my/ebook' },
    { text: 'Claim Free Zoom Pass', url: 'https://alaminedu.com.my/webinar' },
  ];

  // AI Assistant trigger (LIB-10)
  const handleOpenAiModal = (task: 'variations' | 'cta' | 'rewrite') => {
    setAiTask(task);
    setAiResult('');
    setAiModalOpen(true);
  };

  const handleExecuteAi = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await onCallAi(
        formData.title,
        formData.message,
        aiTargetPlatform,
        aiTask,
        aiUseThinking
      );
      setAiResult(res);
    } catch (e: any) {
      setAiResult('Error: ' + (e.message || 'Failed to generate suggestions.'));
    } finally {
      setAiLoading(false);
    }
  };

  // Export CSV (LIB-11)
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Format', 'Status', 'Category', 'Platforms', 'Times Scheduled'];
    const rows = filteredItems.map((item) => [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      item.format,
      item.status,
      item.category?.name || '',
      item.platforms?.map((p) => p.platform).join('; ') || '',
      item.times_scheduled || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `al_amin_content_library_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'approved':
        return 'bg-teal-100 text-[#0A726F] border-teal-300';
      case 'pending_approval':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0A726F]">
            Content Library
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Central repository to create, curate, categorize, and reuse Al Amin Edu Oasis marketing assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export Button (LIB-11) */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold shadow-2xs transition"
            title="Export content list to CSV"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Create Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E9F9A] hover:bg-[#0A726F] text-white text-xs font-semibold shadow-md shadow-[#0E9F9A]/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Content</span>
          </button>
        </div>
      </div>

      {/* Filter and View Toggle Toolbar (LIB-02, LIB-03) */}
      <div className="glass-card rounded-2xl p-4 border border-white/70 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, caption text, or tags..."
              className="w-full pl-9 pr-3 py-2 bg-white/80 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0E9F9A]/40 outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-gray-200 rounded-xl text-xs outline-none text-gray-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-gray-200 rounded-xl text-xs outline-none text-gray-700"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="threads">Threads</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="website">Website</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-gray-200 rounded-xl text-xs outline-none text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Second Row: Format filter & Grid / List View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 font-medium">Format:</span>
            {['all', 'poster', 'carousel', 'video', 'text'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFormat(f)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize transition ${
                  selectedFormat === f
                    ? 'bg-[#0E9F9A] text-white font-semibold'
                    : 'bg-white hover:bg-gray-100 text-gray-600'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Showing <strong>{filteredItems.length}</strong> items
            </span>

            {/* View Mode Toggle (LIB-02) */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white text-[#0E9F9A] shadow-xs' : 'text-gray-500'
                }`}
                title="Grid View (Thumbnails)"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-white text-[#0E9F9A] shadow-xs' : 'text-gray-500'
                }`}
                title="Table / List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Floating Bar (LIB-09) */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#0A726F] text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-lg">
              {selectedIds.length} items selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Status */}
            <button
              onClick={() => onBulkAction(selectedIds, 'status', 'approved')}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-medium transition"
            >
              Approve All
            </button>
            <button
              onClick={() => onBulkAction(selectedIds, 'archive', 'archived')}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-medium transition"
            >
              Archive
            </button>

            {/* Bulk Tag */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={bulkTagInput}
                onChange={(e) => setBulkTagInput(e.target.value)}
                placeholder="+ Add tag..."
                className="px-2 py-1 rounded-lg text-xs bg-white text-gray-800 outline-none w-28"
              />
              <button
                onClick={() => {
                  if (bulkTagInput.trim()) {
                    onBulkAction(selectedIds, 'add_tag', bulkTagInput.trim());
                    setBulkTagInput('');
                  }
                }}
                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs font-semibold"
              >
                Save
              </button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-white/80 hover:text-white underline ml-2"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Grid View (LIB-02) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const firstAsset = item.assets?.[0];

            return (
              <div
                key={item.id}
                className={`glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border transition-all ${
                  isSelected ? 'border-[#0E9F9A] ring-2 ring-[#0E9F9A]/30' : 'border-white/80'
                }`}
              >
                <div>
                  {/* Visual Preview / Thumbnail (LIB-04) */}
                  <div className="relative h-44 bg-slate-900/10 overflow-hidden group">
                    {firstAsset?.url ? (
                      <img
                        src={firstAsset.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                        <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          No Visual Asset
                        </span>
                      </div>
                    )}

                    {/* Format Indicator Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                        {item.format === 'carousel' && <Layers className="w-3 h-3 text-[#0E9F9A]" />}
                        {item.format === 'video' && <Play className="w-3 h-3 text-red-400" />}
                        {item.format === 'poster' && <ImageIcon className="w-3 h-3 text-amber-400" />}
                        {item.format === 'text' && <FileText className="w-3 h-3 text-sky-400" />}
                        <span>{item.format}</span>
                        {item.format === 'carousel' && ` (${item.assets?.length || 1})`}
                      </span>
                    </div>

                    {/* Checkbox for bulk select */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(item.id);
                      }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-md bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-700 shadow-sm"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#0E9F9A]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Hover Quick Preview Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setPreviewItem(item);
                          setActiveSlideIndex(0);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white text-gray-900 text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:bg-gray-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0E9F9A]" />
                        <span>Full Preview</span>
                      </button>
                    </div>
                  </div>

                  {/* Content Meta & Details */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${item.category?.color || '#0E9F9A'}20`,
                          color: item.category?.color || '#0E9F9A',
                        }}
                      >
                        {item.category?.name || 'General'}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3
                      onClick={() => {
                        setPreviewItem(item);
                        setActiveSlideIndex(0);
                      }}
                      className="text-sm font-heading font-bold text-gray-800 line-clamp-2 hover:text-[#0E9F9A] cursor-pointer"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    {/* Platforms Badges */}
                    <div className="flex flex-wrap items-center gap-1">
                      {item.platforms?.map((p) => (
                        <span
                          key={p.platform}
                          className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold"
                        >
                          {p.platform}
                        </span>
                      ))}
                    </div>

                    {/* Reuse Counter & Last Used Tag (LIB-07) */}
                    <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="font-medium text-[#0A726F]">
                        Scheduled {item.times_scheduled || 0}x
                      </span>
                      {item.last_used_at ? (
                        <span>
                          Last: {new Date(item.last_used_at).toLocaleDateString('en-US')}
                        </span>
                      ) : (
                        <span className="text-gray-300">Never scheduled</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (LIB-06 & CRUD) */}
                <div className="px-5 pb-5 pt-0 flex items-center justify-between gap-2 border-t border-transparent">
                  {/* Direct "Schedule" button (LIB-06) */}
                  <button
                    onClick={() => onScheduleItem(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#0E9F9A] hover:bg-[#0A726F] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl text-gray-600 hover:text-[#0E9F9A] hover:bg-gray-100 transition"
                      title="Edit content"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateItem(item.id)}
                      className="p-2 rounded-xl text-gray-600 hover:text-[#0E9F9A] hover:bg-gray-100 transition"
                      title="Duplicate content"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Permanently delete (Owner only)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View (LIB-02) */
        <div className="glass-card rounded-2xl overflow-hidden border border-white/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredItems.length && filteredItems.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-3">Content Item</th>
                  <th className="p-3">Format</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Platforms</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Usage</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                      />
                    </td>
                    <td className="p-3 max-w-xs">
                      <p
                        onClick={() => {
                          setPreviewItem(item);
                          setActiveSlideIndex(0);
                        }}
                        className="font-semibold text-gray-800 hover:text-[#0E9F9A] cursor-pointer truncate"
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{item.message}</p>
                    </td>
                    <td className="p-3 capitalize font-medium text-gray-600">{item.format}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100">
                        {item.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {item.platforms?.map((p) => (
                          <span
                            key={p.platform}
                            className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 capitalize"
                          >
                            {p.platform}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      Scheduled {item.times_scheduled || 0}x
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onScheduleItem(item)}
                          className="px-2 py-1 bg-[#0E9F9A] text-white rounded text-[11px] font-semibold hover:bg-[#0A726F]"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 text-gray-500 hover:text-[#0E9F9A]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateItem(item.id)}
                          className="p-1 text-gray-500 hover:text-[#0E9F9A]"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visual Preview Modal (LIB-04 & LIB-05 Platform Mockup) */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/60 max-h-[90vh]">
            {/* Left Preview Pane */}
            <div className="md:w-1/2 bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
              <div className="w-full max-w-sm">
                {/* Platform Frame Toggle (LIB-05) */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {(['instagram', 'facebook', 'threads'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setMockupPlatform(p)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                        mockupPlatform === p
                          ? 'bg-[#0E9F9A] text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Social Media Card Mockup (LIB-05) */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl text-gray-900 border border-gray-100">
                  {/* Account Header */}
                  <div className="p-3 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0E9F9A] text-white flex items-center justify-center text-xs font-bold">
                        AO
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">alamineduoasis</p>
                        <p className="text-[10px] text-gray-400">Bandar Baru Bangi, Malaysia</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">•••</span>
                  </div>

                  {/* Media (Poster or Carousel Slider) (LIB-04) */}
                  <div className="relative aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {previewItem.assets && previewItem.assets.length > 0 ? (
                      <>
                        <img
                          src={previewItem.assets[activeSlideIndex]?.url || previewItem.assets[0].url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {/* Carousel Swipe Controls */}
                        {previewItem.assets.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setActiveSlideIndex((prev) =>
                                  prev > 0 ? prev - 1 : previewItem.assets!.length - 1
                                )
                              }
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setActiveSlideIndex((prev) =>
                                  prev < previewItem.assets!.length - 1 ? prev + 1 : 0
                                )
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Dot indicators */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                              {previewItem.assets.map((_, i) => (
                                <span
                                  key={i}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    i === activeSlideIndex
                                      ? 'bg-[#0E9F9A] w-4'
                                      : 'bg-white/70'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="p-6 text-center text-gray-500 text-xs">
                        <p className="font-semibold">{previewItem.title}</p>
                      </div>
                    )}
                  </div>

                  {/* Caption & CTA */}
                  <div className="p-3 text-xs space-y-1.5">
                    {previewItem.cta_text && (
                      <div className="p-2 rounded-lg bg-[#E3F6F5] text-[#0A726F] font-semibold text-center text-xs flex items-center justify-center gap-1.5">
                        <span>{previewItem.cta_text}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <p className="line-clamp-3 leading-snug">
                      <strong className="mr-1">alamineduoasis</strong>
                      {previewItem.message}
                    </p>
                    <div className="text-[10px] text-gray-400">
                      {previewItem.tags.map((t) => `#${t} `)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Details Pane */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-[#0E9F9A] uppercase tracking-wider">
                    Content Details (PRD Section 5.3)
                  </span>
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <h3 className="text-lg font-heading font-bold text-gray-800">
                    {previewItem.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E3F6F5] text-[#0A726F]">
                      {previewItem.category?.name || 'General'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                        previewItem.status
                      )}`}
                    >
                      Status: {previewItem.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Full Caption Message:
                    </h5>
                    <p className="mt-1 text-xs text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-xl border border-gray-100 max-h-40 overflow-y-auto">
                      {previewItem.message}
                    </p>
                  </div>

                  {previewItem.cta_text && (
                    <div className="text-xs">
                      <span className="font-bold text-gray-500">CTA: </span>
                      <a
                        href={previewItem.cta_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0E9F9A] hover:underline font-semibold"
                      >
                        {previewItem.cta_text} ({previewItem.cta_url || 'No URL specified'})
                      </a>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
                    <p>
                      <strong>Reuse Frequency:</strong> Scheduled {previewItem.times_scheduled || 0} times
                    </p>
                    <p>
                      <strong>Created By:</strong> {previewItem.creator?.full_name || 'Al Amin Staff'}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{' '}
                      {new Date(previewItem.updated_at).toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={() => {
                    const item = previewItem;
                    setPreviewItem(null);
                    onScheduleItem(item);
                  }}
                  className="px-4 py-2 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule This Post</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const item = previewItem;
                      setPreviewItem(null);
                      handleOpenEdit(item);
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDuplicateItem(previewItem.id);
                      setPreviewItem(null);
                    }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                  >
                    Duplicate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal (LIB-01, LIB-08, LIB-10) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 my-8 border border-white/80 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-heading font-bold text-[#0A726F]">
                  {editingItem ? 'Update Content Item' : 'Create New Content Item'}
                </h3>
                <p className="text-xs text-gray-500">
                  Complete marketing post specifications according to PRD 5.3.1
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-5 space-y-5">
              {/* Title with char counter (150 max) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Content Title (Required, max 150 characters)
                  </label>
                  <span
                    className={`text-[11px] ${
                      formData.title.length > 140 ? 'text-red-500 font-bold' : 'text-gray-400'
                    }`}
                  >
                    {formData.title.length}/150
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. School Holiday Camp: Young Huffaz & AI Robotics 2026"
                    className="flex-1 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0E9F9A]/40 outline-none"
                  />
                  {/* AI Headline Button (LIB-10) */}
                  <button
                    type="button"
                    onClick={() => handleOpenAiModal('variations')}
                    className="px-3 py-2 rounded-xl bg-[#E3F6F5] hover:bg-[#cbeeed] text-[#0A726F] text-xs font-semibold flex items-center gap-1.5 transition flex-shrink-0"
                    title="Generate headline variations with Gemini"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#0E9F9A]" />
                    <span>AI Headlines</span>
                  </button>
                </div>
              </div>

              {/* Message with char counter & AI platform rewrite */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Message / Caption (Supports newlines and emojis)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">
                      {formData.message.length} chars
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenAiModal('rewrite')}
                      className="text-xs text-[#0E9F9A] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI Rewrite (Gemini)</span>
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter full caption copy here..."
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0E9F9A]/40 outline-none"
                />
              </div>

              {/* Call To Action (CTA) & Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">CTA Button Text</label>
                    <button
                      type="button"
                      onClick={() => handleOpenAiModal('cta')}
                      className="text-[11px] text-[#0E9F9A] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI CTA Ideas</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="e.g. Register Now & Save 15%"
                    className="w-full px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0E9F9A]/40 outline-none"
                  />
                  {/* Preset CTA Pills */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {ctaTemplates.slice(0, 3).map((tpl) => (
                      <button
                        key={tpl.text}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, cta_text: tpl.text, cta_url: tpl.url })
                        }
                        className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 hover:bg-[#E3F6F5] text-gray-600 hover:text-[#0A726F] transition"
                      >
                        {tpl.text.slice(0, 22)}...
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    CTA Destination URL
                  </label>
                  <input
                    type="url"
                    value={formData.cta_url}
                    onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                    placeholder="https://alaminedu.com.my/register"
                    className="w-full px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0E9F9A]/40 outline-none"
                  />
                </div>
              </div>

              {/* Format & Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Format Type
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) =>
                      setFormData({ ...formData, format: e.target.value as ContentFormat })
                    }
                    className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs outline-none"
                  >
                    <option value="poster">Poster (Single Image)</option>
                    <option value="carousel">Carousel (Multiple Slides)</option>
                    <option value="video">Video</option>
                    <option value="text">Text Only</option>
                    <option value="article">Website Article</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Content Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Workflow Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ContentStatus })
                    }
                    className="w-full px-3 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    {isOwner && <option value="approved">Approved</option>}
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Multi-Platform Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target Publishing Channels (Multi-select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    ['facebook', 'instagram', 'threads', 'tiktok', 'linkedin', 'website'] as SocialPlatform[]
                  ).map((plat) => {
                    const isChecked = formData.platforms.includes(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            platforms: isChecked
                              ? formData.platforms.filter((p) => p !== plat)
                              : [...formData.platforms, plat],
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-[#0E9F9A] text-white shadow-xs'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                        <span>{plat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Assets & Carousel Builder (LIB-04, LIB-08) */}
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">
                    Visual Media / Carousel Slides (LIB-08: JPG, PNG, WebP)
                  </span>
                  {formData.format === 'carousel' && (
                    <button
                      type="button"
                      onClick={handleAddSlide}
                      className="text-xs font-semibold text-[#0E9F9A] hover:underline"
                    >
                      + Add Slide
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {formData.assets.map((asset, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={asset.url}
                        onChange={(e) => {
                          const updated = [...formData.assets];
                          updated[idx].url = e.target.value;
                          setFormData({ ...formData, assets: updated });
                        }}
                        placeholder="Image URL link (Unsplash, Drive, Canva, etc.)"
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={asset.alt_text}
                        onChange={(e) => {
                          const updated = [...formData.assets];
                          updated[idx].alt_text = e.target.value;
                          setFormData({ ...formData, assets: updated });
                        }}
                        placeholder="Alt text"
                        className="w-36 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none"
                      />
                      {formData.assets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlide(idx)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Content Tags (e.g. Ramadan, Admissions2027)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50/70 border border-gray-200 rounded-xl">
                  {formData.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#E3F6F5] text-[#0A726F] text-xs flex items-center gap-1"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((_, idx) => idx !== i),
                          })
                        }
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={formData.tagInput}
                    onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        if (formData.tagInput.trim()) {
                          setFormData({
                            ...formData,
                            tags: [...formData.tags, formData.tagInput.trim().replace(/^#/, '')],
                            tagInput: '',
                          });
                        }
                      }
                    }}
                    placeholder="Press enter to add tag..."
                    className="flex-1 bg-transparent text-xs outline-none min-w-[120px]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0E9F9A] hover:bg-[#0A726F] text-white text-xs font-semibold shadow-md shadow-[#0E9F9A]/20 transition"
                >
                  {editingItem ? 'Save Changes' : 'Create Content Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Modal (LIB-10) with High Thinking Option */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0E9F9A] to-[#0A726F] text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-heading font-bold text-[#0A726F]">
                    Al Amin AI Copywriting Assistant (Gemini)
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Human-reviewed creative suggestions prior to saving (PRD LIB-10)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    AI Task
                  </label>
                  <select
                    value={aiTask}
                    onChange={(e: any) => setAiTask(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  >
                    <option value="variations">3 Headline Variations</option>
                    <option value="cta">4 Call To Action (CTA) Variations</option>
                    <option value="rewrite">Rewrite for Target Channel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Channel
                  </label>
                  <select
                    value={aiTargetPlatform}
                    onChange={(e) => setAiTargetPlatform(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Threads">Threads</option>
                    <option value="TikTok">TikTok</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>
              </div>

              {/* Thinking Mode Toggle (from system requirement) */}
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-purple-900 block">
                      Deep Thinking Mode (Gemini 4 Argon)
                    </span>
                    <span className="text-[10px] text-purple-700">
                      High-level reasoning for competitive educational marketing strategy
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={aiUseThinking}
                  onChange={(e) => setAiUseThinking(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>

              {/* Execute Button */}
              <button
                type="button"
                onClick={handleExecuteAi}
                disabled={aiLoading}
                className="w-full py-2.5 rounded-xl bg-[#0E9F9A] hover:bg-[#0A726F] text-white text-xs font-semibold shadow-md shadow-[#0E9F9A]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? (
                  <span>Generating creative ideas...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Suggestions</span>
                  </>
                )}
              </button>

              {/* Output Result */}
              {aiResult && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-600 uppercase text-[10px]">
                      Generated AI Output:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (aiTask === 'variations') {
                          const firstLine = aiResult.split('\n')[0].replace(/^\d+\.\s*/, '');
                          setFormData({ ...formData, title: firstLine });
                        } else if (aiTask === 'cta') {
                          const firstCta = aiResult.split('\n')[0].replace(/^\d+\.\s*/, '');
                          setFormData({ ...formData, cta_text: firstCta });
                        } else {
                          setFormData({ ...formData, message: aiResult });
                        }
                        setAiModalOpen(false);
                      }}
                      className="text-xs font-bold text-[#0E9F9A] hover:underline"
                    >
                      Apply to Form
                    </button>
                  </div>
                  <pre className="whitespace-pre-line font-sans text-xs max-h-48 overflow-y-auto bg-white p-2.5 rounded-lg border border-gray-100">
                    {aiResult}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
