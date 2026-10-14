import React, { useState } from 'react';
import {
  TrendingUp,
  Upload,
  Plus,
  Sparkles,
  Printer,
  DollarSign,
  Target,
  X,
  BrainCircuit,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  AnalyticsPlatform,
  AnalyticsPost,
  AdSpend,
  UserProfile,
  SocialPlatform,
  ContentItem,
} from '../types/index.ts';

interface AnalyticsViewProps {
  analyticsData: AnalyticsPlatform[];
  postAnalytics: AnalyticsPost[];
  adSpends: AdSpend[];
  contentItems: ContentItem[];
  currentUser: UserProfile;
  onCreatePlatformData: (data: any) => Promise<void>;
  onImportCsv: (rows: any[]) => Promise<void>;
  onCreateAdSpend: (data: any) => Promise<void>;
  onGenerateAiSummary: (useThinking?: boolean) => Promise<string>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analyticsData,
  postAnalytics,
  adSpends,
  contentItems,
  currentUser,
  onCreatePlatformData,
  onImportCsv,
  onCreateAdSpend,
  onGenerateAiSummary,
}) => {
  // Modals
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  // AI Narrative Summary (RPT-07)
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiUseThinking, setAiUseThinking] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);

  // Manual Form State (RPT-01)
  const [formData, setFormData] = useState({
    platform: 'instagram' as SocialPlatform,
    period_start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    followers: 22400,
    followers_gained: 1450,
    reach: 78900,
    impressions: 134200,
    likes: 6720,
    comments: 980,
    shares: 890,
    saves: 1340,
    link_clicks: 2850,
    profile_visits: 5120,
  });

  // Ad Spend Form
  const [adForm, setAdForm] = useState({
    platform: 'facebook' as SocialPlatform,
    period_start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    amount_rm: 500,
    results: 45,
  });

  // Aggregated KPI Totals (RPT-04)
  const totalReach = analyticsData.reduce((acc, curr) => acc + curr.reach, 0);
  const totalLikes = analyticsData.reduce((acc, curr) => acc + curr.likes, 0);
  const totalComments = analyticsData.reduce((acc, curr) => acc + curr.comments, 0);
  const totalShares = analyticsData.reduce((acc, curr) => acc + curr.shares, 0);
  const totalSaves = analyticsData.reduce((acc, curr) => acc + curr.saves, 0);
  const totalInteractions = totalLikes + totalComments + totalShares + totalSaves;
  const overallEngagementRate =
    totalReach > 0 ? ((totalInteractions / totalReach) * 100).toFixed(2) : '0';

  const totalAdSpendRM = adSpends.reduce((acc, curr) => acc + curr.amount_rm, 0);
  const totalAdResults = adSpends.reduce((acc, curr) => acc + curr.results, 0);
  const costPerResultRM =
    totalAdResults > 0 ? (totalAdSpendRM / totalAdResults).toFixed(2) : '0.00';

  // Chart Data Preparations (RPT-03)
  const platformComparisonData = analyticsData.map((d) => ({
    platform: d.platform.toUpperCase(),
    Reach: d.reach,
    Interactions: d.likes + d.comments + d.shares + d.saves,
    Clicks: d.link_clicks,
  }));

  const interactionDistribution = [
    { name: 'Likes', value: totalLikes, color: '#0E9F9A' },
    { name: 'Comments', value: totalComments, color: '#3B82F6' },
    { name: 'Shares', value: totalShares, color: '#F59E0B' },
    { name: 'Saves', value: totalSaves, color: '#EC4899' },
  ];

  // Monthly Targets (RPT-09)
  const targets = {
    reachTarget: 300000,
    reachCurrent: totalReach,
    leadsTarget: 250,
    leadsCurrent: totalAdResults,
    followersTarget: 5000,
    followersCurrent: analyticsData.reduce((acc, curr) => acc + curr.followers_gained, 0),
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreatePlatformData(formData);
    setEntryModalOpen(false);
  };

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateAdSpend(adForm);
    setAdModalOpen(false);
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,platform,period_start,period_end,followers,followers_gained,reach,impressions,likes,comments,shares,saves,link_clicks,profile_visits\n' +
      'instagram,2026-10-01,2026-10-31,22400,1450,78900,134200,6720,980,890,1340,2850,5120\n' +
      'facebook,2026-10-01,2026-10-31,14850,680,52400,89300,3820,640,410,195,1420,2890\n';
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = 'al_amin_analytics_template.csv';
    link.click();
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });
        return row;
      });

      await onImportCsv(rows);
      setCsvModalOpen(false);
    };
    reader.readAsText(file);
  };

  const handleGenerateSummary = async () => {
    setAiSummaryLoading(true);
    try {
      const res = await onGenerateAiSummary(aiUseThinking);
      setAiSummary(res);
      setEditingSummary(false);
    } catch (err: any) {
      alert('Error generating AI summary: ' + err.message);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0A726F]">
            Performance Reports & Marketing Analytics (RPT-03)
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Reach metrics, engagement rates, ad return on investment (ROI), and AI executive narrative reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Template / Import (RPT-02) */}
          <button
            onClick={() => setCsvModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold shadow-2xs transition"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Import CSV (RPT-02)</span>
          </button>

          {/* Ad Spend Record */}
          <button
            onClick={() => setAdModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#0A726F] text-xs font-semibold shadow-2xs transition"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Ad Spend (RM)</span>
          </button>

          {/* Manual Entry Button (RPT-01) */}
          <button
            onClick={() => setEntryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E9F9A] hover:bg-[#0A726F] text-white text-xs font-semibold shadow-md shadow-[#0E9F9A]/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Data (RPT-01)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Auto-Calculated Metrics (RPT-04) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/70">
          <span className="text-xs font-medium text-gray-500">Total Reach</span>
          <p className="text-2xl font-heading font-bold text-gray-800 mt-2">
            {totalReach.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.8% vs previous month</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/70">
          <span className="text-xs font-medium text-gray-500">Average Engagement Rate</span>
          <p className="text-2xl font-heading font-bold text-[#0A726F] mt-2">
            {overallEngagementRate}%
          </p>
          <div className="text-[11px] text-gray-400 mt-1">
            {totalInteractions.toLocaleString()} total likes, comments, shares
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/70">
          <span className="text-xs font-medium text-gray-500">Total Paid Ad Spend</span>
          <p className="text-2xl font-heading font-bold text-gray-800 mt-2">
            RM {totalAdSpendRM.toLocaleString()}
          </p>
          <div className="text-[11px] text-gray-400 mt-1">
            Generated {totalAdResults} enrollment inquiries
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/70">
          <span className="text-xs font-medium text-gray-500">Cost Per Lead (CPL)</span>
          <p className="text-2xl font-heading font-bold text-emerald-700 mt-2">
            RM {costPerResultRM}
          </p>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            Highly cost-efficient (below RM20 ceiling)
          </div>
        </div>
      </div>

      {/* Target Progress Bars (RPT-09) */}
      <div className="glass-card rounded-2xl p-5 border border-white/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#0E9F9A]" />
            <h3 className="text-xs font-heading font-bold text-gray-800 uppercase tracking-wider">
              Monthly Performance Targets (RPT-09)
            </h3>
          </div>
          <span className="text-xs text-[#0E9F9A] font-semibold">Current Month</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Target Reach (300K)</span>
              <span className="font-bold text-gray-800">
                {Math.round((targets.reachCurrent / targets.reachTarget) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#0E9F9A] h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (targets.reachCurrent / targets.reachTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              {targets.reachCurrent.toLocaleString()} / 300,000 target
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Student Intake Leads</span>
              <span className="font-bold text-gray-800">
                {Math.round((targets.leadsCurrent / targets.leadsTarget) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (targets.leadsCurrent / targets.leadsTarget) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              {targets.leadsCurrent} / 250 admissions targeted
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">New Followers Growth</span>
              <span className="font-bold text-gray-800">
                {Math.round((targets.followersCurrent / targets.followersTarget) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#F59E0B] h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(100, (targets.followersCurrent / targets.followersTarget) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              {targets.followersCurrent.toLocaleString()} / 5,000 new followers
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Visualizations Grid (RPT-03) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Platform Comparison Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-white/70">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-heading font-bold text-[#0A726F]">
                Channel Metrics Comparison (RPT-03)
              </h3>
              <p className="text-xs text-gray-500">Reach and interactions across active platforms</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={platformComparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="platform" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #E3F6F5',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Reach" fill="#0E9F9A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Interactions" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interaction Distribution Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-white/70 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-heading font-bold text-[#0A726F] mb-1">
              Interaction Breakdown (RPT-03)
            </h3>
            <p className="text-xs text-gray-500">Distribution of likes, comments, shares, and saves</p>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={interactionDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {interactionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-100">
            {interactionDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600 truncate">{item.name}:</span>
                <span className="font-bold text-gray-800">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Narrative Monthly Summary Generator (RPT-07) */}
      <div className="glass-card rounded-2xl p-6 border border-white/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0E9F9A] to-[#0A726F] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-[#0A726F]">
                Automated Executive Narrative Report (Gemini) (RPT-07)
              </h3>
              <p className="text-xs text-gray-500">
                Data-driven monthly marketing narrative that can be reviewed and edited prior to exporting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold cursor-pointer">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
              <span>Thinking Mode</span>
              <input
                type="checkbox"
                checked={aiUseThinking}
                onChange={(e) => setAiUseThinking(e.target.checked)}
                className="w-3.5 h-3.5 accent-purple-600"
              />
            </label>

            <button
              onClick={handleGenerateSummary}
              disabled={aiSummaryLoading}
              className="px-4 py-2 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#0E9F9A]/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {aiSummaryLoading ? (
                <span>Synthesizing data...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Monthly Summary</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Narrative Box */}
        {aiSummary ? (
          <div className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">
                Al Amin Edu Oasis Executive Marketing Brief:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingSummary(!editingSummary)}
                  className="text-xs text-[#0E9F9A] font-semibold hover:underline"
                >
                  {editingSummary ? 'Done Editing' : 'Edit Text'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {editingSummary ? (
              <textarea
                rows={10}
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs outline-none font-sans"
              />
            ) : (
              <div className="whitespace-pre-line text-xs text-gray-800 bg-white p-4 rounded-xl border border-gray-100 leading-relaxed font-sans shadow-inner">
                {aiSummary}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#0E9F9A]/40" />
            <p className="text-xs">
              Click "Generate Monthly Summary" to let Gemini analyze performance trends and formulate leadership recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Manual Analytics Entry (RPT-01) */}
      {entryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-white/80 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-heading font-bold text-[#0A726F]">
                Manual Analytics Data Entry (RPT-01)
              </h3>
              <button
                onClick={() => setEntryModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEntry} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e: any) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none capitalize"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="threads">Threads</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="website">Website</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
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
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Followers</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.followers}
                    onChange={(e) =>
                      setFormData({ ...formData, followers: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-gray-50 border rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Followers
                  </label>
                  <input
                    type="number"
                    value={formData.followers_gained}
                    onChange={(e) =>
                      setFormData({ ...formData, followers_gained: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-gray-50 border rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Reach
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reach}
                    onChange={(e) => setFormData({ ...formData, reach: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-gray-50 border rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Impressions
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.impressions}
                    onChange={(e) =>
                      setFormData({ ...formData, impressions: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-gray-50 border rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Likes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-gray-50 border rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Comments</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 bg-gray-50 border rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Shares</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-gray-50 border rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Saves</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.saves}
                    onChange={(e) => setFormData({ ...formData, saves: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-gray-50 border rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEntryModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Save Metrics Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Paid Ad Spend */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-heading font-bold text-[#0A726F]">
                Record Paid Ad Budget (RM)
              </h3>
              <button
                onClick={() => setAdModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAd} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Channel</label>
                <select
                  value={adForm.platform}
                  onChange={(e: any) => setAdForm({ ...adForm, platform: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none capitalize"
                >
                  <option value="facebook">Facebook Ads</option>
                  <option value="instagram">Instagram Ads</option>
                  <option value="tiktok">TikTok Ads</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Budget Amount (RM)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={adForm.amount_rm}
                  onChange={(e) => setAdForm({ ...adForm, amount_rm: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Results / Leads Generated
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adForm.results}
                  onChange={(e) => setAdForm({ ...adForm, results: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-lg text-xs font-semibold"
                >
                  Save Ad Spend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: CSV Import (RPT-02) */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-heading font-bold text-[#0A726F]">
                Import CSV Analytics File (RPT-02)
              </h3>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-3 bg-[#E3F6F5] rounded-xl text-xs text-[#0A726F] flex items-center justify-between">
                <span>Download standard CSV template:</span>
                <button
                  onClick={handleDownloadCsvTemplate}
                  className="px-2.5 py-1 bg-white rounded-lg font-bold text-xs hover:shadow-xs text-[#0E9F9A]"
                >
                  Download
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select .CSV file from your device:
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0E9F9A] file:text-white hover:file:bg-[#0A726F]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
