import React, { useState } from 'react';
import {
  FolderArchive,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Edit3,
  Video,
  Image as ImageIcon,
  HardDrive,
  FileText,
  Tag,
  Grid,
  List,
  Calendar,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { RawContentItem, UserProfile } from '../types/index.ts';

interface RawContentViewProps {
  items: RawContentItem[];
  currentUser: UserProfile;
  onCreateItem: (data: {
    title: string;
    link: string;
    category?: string;
    tags?: string[];
    file_type?: string;
    notes?: string;
  }) => Promise<void>;
  onUpdateItem: (id: string, updates: Partial<RawContentItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onSendToLibrary?: (item: RawContentItem) => void;
}

export const RawContentView: React.FC<RawContentViewProps> = ({
  items,
  currentUser,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onSendToLibrary,
}) => {
  const isOwner = currentUser.role === 'owner';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawContentItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formCategory, setFormCategory] = useState('Program Photos');
  const [formType, setFormType] = useState<'drive' | 'video' | 'photo' | 'document' | 'other'>('drive');
  const [formTags, setFormTags] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'Program Photos',
    'Event Videos',
    'Classroom Footage',
    'Raw Interviews',
    'Sports & Activities',
    'General Footage',
  ];

  // Filter items
  const filteredItems = items.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchNotes && !matchTags) return false;
    }
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedType !== 'all' && item.file_type !== selectedType) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormLink('');
    setFormCategory('Program Photos');
    setFormType('drive');
    setFormTags('');
    setFormNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: RawContentItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormLink(item.link);
    setFormCategory(item.category || 'Program Photos');
    setFormType((item.file_type as any) || 'drive');
    setFormTags(item.tags ? item.tags.join(', ') : '');
    setFormNotes(item.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formLink.trim()) {
      alert('Please enter both Title and Link URL.');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (editingItem) {
      await onUpdateItem(editingItem.id, {
        title: formTitle.trim(),
        link: formLink.trim(),
        category: formCategory,
        file_type: formType,
        tags: tagsArray,
        notes: formNotes.trim(),
      });
    } else {
      await onCreateItem({
        title: formTitle.trim(),
        link: formLink.trim(),
        category: formCategory,
        file_type: formType,
        tags: tagsArray,
        notes: formNotes.trim(),
      });
    }
    setModalOpen(false);
  };

  const handleCopyLink = (item: RawContentItem) => {
    navigator.clipboard.writeText(item.link);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStorageBadge = (type?: string, link?: string) => {
    const l = (link || '').toLowerCase();
    if (l.includes('drive.google.com') || type === 'drive') {
      return {
        label: 'Google Drive',
        icon: HardDrive,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }
    if (l.includes('dropbox.com')) {
      return {
        label: 'Dropbox',
        icon: HardDrive,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    }
    if (l.includes('onedrive') || l.includes('1drv.ms')) {
      return {
        label: 'OneDrive',
        icon: HardDrive,
        color: 'bg-sky-50 text-sky-700 border-sky-200',
      };
    }
    if (type === 'video' || l.includes('youtube') || l.includes('vimeo')) {
      return {
        label: 'Video Footage',
        icon: Video,
        color: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (type === 'photo' || l.includes('photos.app.goo.gl')) {
      return {
        label: 'Photo Album',
        icon: ImageIcon,
        color: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    }
    return {
      label: 'Cloud Asset',
      icon: FileText,
      color: 'bg-gray-50 text-gray-700 border-gray-200',
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0E9F9A] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Al Amin Media Vault</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#0A726F]">
            Raw Content & Footage Vault
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Store raw event footage, unedited school program photo drives, and media links for quick reference and repurposing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E9F9A] hover:bg-[#0A726F] text-white text-xs font-semibold shadow-md shadow-[#0E9F9A]/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Raw Footage / Link</span>
          </button>
        </div>
      </div>

      {/* Quick Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-white/80">
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            Total Vault Assets
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-heading font-bold text-gray-800">{items.length}</h3>
            <span className="text-[11px] text-[#0E9F9A] font-medium">Links recorded</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/80">
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            Cloud Drives
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-heading font-bold text-gray-800">
              {
                items.filter(
                  (i) =>
                    i.file_type === 'drive' ||
                    i.link.includes('drive.google.com') ||
                    i.link.includes('dropbox') ||
                    i.link.includes('onedrive')
                ).length
              }
            </h3>
            <span className="text-[11px] text-blue-600 font-medium">Drive folders</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/80">
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            Video Takes
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-heading font-bold text-gray-800">
              {items.filter((i) => i.file_type === 'video' || i.category?.includes('Video')).length}
            </h3>
            <span className="text-[11px] text-rose-600 font-medium">Footage clips</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/80">
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            Photo Albums
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-heading font-bold text-gray-800">
              {items.filter((i) => i.file_type === 'photo' || i.category?.includes('Photo')).length}
            </h3>
            <span className="text-[11px] text-amber-600 font-medium">Raw batches</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search footage titles, tags, or notes..."
            className="w-full pl-9 pr-3 py-2 bg-white/80 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white text-gray-800"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none text-gray-700 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Storage Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none text-gray-700 cursor-pointer"
          >
            <option value="all">All File Types</option>
            <option value="drive">Drive / Cloud Folder</option>
            <option value="video">Raw Video</option>
            <option value="photo">Photo Album</option>
            <option value="document">Document / PDF</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#0A726F]' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-[#0A726F]' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        filteredItems.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl border border-white/60">
            <FolderArchive className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-700">No raw media items found</h4>
            <p className="text-xs text-gray-400 mt-1">
              Add your Google Drive or photo links by clicking "+ Add Raw Footage / Link".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const badge = getStorageBadge(item.file_type, item.link);
              const BadgeIcon = badge.icon;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className="glass-card glass-card-hover rounded-2xl p-5 border border-white/80 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.color}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      {item.category && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E3F6F5] text-[#0A726F]">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-heading font-bold text-gray-800 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Link Snippet Bar */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 border border-gray-200/80 text-xs">
                      <span className="font-mono text-[11px] text-gray-500 truncate max-w-[200px]">
                        {item.link}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyLink(item)}
                          className="p-1 text-gray-500 hover:text-[#0E9F9A] rounded-md transition cursor-pointer"
                          title="Copy Link URL"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-[#0E9F9A] hover:text-[#0A726F] rounded-md transition"
                          title="Open Link in New Tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Notes Snippet */}
                    {item.notes && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed bg-white/50 p-2.5 rounded-xl border border-gray-100">
                        {item.notes}
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-0.5"
                          >
                            <Tag className="w-2.5 h-2.5 opacity-60" />
                            <span>#{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-gray-400">
                      Added {new Date(item.created_at).toLocaleDateString('en-US')}
                    </span>

                    <div className="flex items-center gap-1">
                      {onSendToLibrary && (
                        <button
                          onClick={() => onSendToLibrary(item)}
                          className="px-2 py-1 bg-[#E3F6F5] hover:bg-[#0E9F9A] text-[#0A726F] hover:text-white rounded-lg text-[10px] font-semibold transition cursor-pointer flex items-center gap-1"
                          title="Create library post using this raw footage"
                        >
                          <Layers className="w-3 h-3" />
                          <span>To Library</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-[#0E9F9A] hover:bg-gray-100 rounded-lg transition cursor-pointer"
                        title="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {(isOwner || item.created_by === currentUser.id) && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Table View */
        <div className="glass-card rounded-2xl overflow-hidden border border-white/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b">
              <tr>
                <th className="p-3.5">Raw Footage Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Storage Link</th>
                <th className="p-3.5">Tags</th>
                <th className="p-3.5">Date Added</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => {
                const badge = getStorageBadge(item.file_type, item.link);
                const BadgeIcon = badge.icon;
                const isCopied = copiedId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3.5 max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#E3F6F5] text-[#0A726F] flex items-center justify-center flex-shrink-0">
                          <BadgeIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 line-clamp-1">{item.title}</p>
                          {item.notes && (
                            <p className="text-[11px] text-gray-400 line-clamp-1">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E3F6F5] text-[#0A726F]">
                        {item.category || 'General'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] text-[#0E9F9A] hover:underline flex items-center gap-1"
                        >
                          <span className="max-w-[160px] truncate">{item.link}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() => handleCopyLink(item)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded transition cursor-pointer"
                          title="Copy Link"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {item.tags?.map((t) => (
                          <span key={t} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5 text-gray-400 text-[11px]">
                      {new Date(item.created_at).toLocaleDateString('en-US')}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-[#0E9F9A] rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-1.5 text-gray-300 hover:text-red-600 rounded-lg transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add or Edit Raw Content Item */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-heading font-bold text-[#0A726F]">
                {editingItem ? 'Edit Raw Content Entry' : 'Add Raw Footage / Media Link'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Title / Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Hari Sukan Tahunan 2026: 4K Drone Footage & Track Sprint Photos"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Media / Cloud Storage Link (URL) *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="e.g. https://drive.google.com/drive/folders/... or Dropbox / OneDrive / YouTube link"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white"
                  />
                  <ExternalLink className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Paste the Google Drive folder, OneDrive, Dropbox, or YouTube unedited link for team reference.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Storage / File Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white"
                  >
                    <option value="drive">Google Drive / Cloud Folder</option>
                    <option value="video">Raw Video Takes</option>
                    <option value="photo">Photo Album</option>
                    <option value="document">Documents & Assets</option>
                    <option value="other">Other Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. HariSukan, Drone4K, TrackEvents, BangiCampus"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notes & Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Camera A & B angles, 4K 60fps unedited footage. Good takes for upcoming intake promotional reels."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer"
                >
                  {editingItem ? 'Update Entry' : 'Save Raw Media'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
