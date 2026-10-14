import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  UserPlus,
  Lock,
  Activity,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { UserProfile, SystemSettings, ActivityLog } from '../types/index.ts';

interface SettingsViewProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  settings: SystemSettings;
  activityLogs: ActivityLog[];
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  onInviteUser: (data: { full_name: string; email: string; role: string }) => Promise<void>;
  onUpdateUserRole: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  onResetDb: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  allUsers,
  settings,
  activityLogs,
  onUpdateSettings,
  onInviteUser,
  onUpdateUserRole,
}) => {
  const isOwner = currentUser.role === 'owner';

  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'logs'>('system');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'marketing_staff' | 'owner'>('marketing_staff');

  const [systemForm, setSystemForm] = useState<SystemSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(systemForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    await onInviteUser({
      full_name: inviteName,
      email: inviteEmail,
      role: inviteRole,
    });
    setInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
  };

  if (!isOwner) {
    return (
      <div className="p-8 text-center glass-card rounded-3xl max-w-md mx-auto my-12 border border-red-200">
        <Lock className="w-12 h-12 text-[#E5484D] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-800">Access Restricted (PRD AUTH-02)</h3>
        <p className="text-xs text-gray-500 mt-1">
          Only system Owners (Admin) have permission to manage institution settings and staff accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0A726F]">
            Administrative & Staff Settings (Owner Only)
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Configure approval workflows, manage marketing staff accounts, and inspect system audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0E9F9A] hover:bg-[#0A726F] text-white text-xs font-semibold shadow-md shadow-[#0E9F9A]/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Invite New Staff</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'system'
              ? 'border-[#0E9F9A] text-[#0A726F]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Workflow & Official Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#0E9F9A] text-[#0A726F]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Team Management ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-[#0E9F9A] text-[#0A726F]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security Audit Trail (AUTH-08)</span>
        </button>
      </div>

      {/* Tab 1: System Settings */}
      {activeTab === 'system' && (
        <form onSubmit={handleSaveSystem} className="space-y-6">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Settings successfully saved and synced to database!</span>
            </div>
          )}

          {/* Approval Workflow Toggle (PRD Section 3 / Section 4) */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 space-y-3">
            <h3 className="text-sm font-heading font-bold text-gray-800">
              Approval Workflow Governance (PRD Section 3 & 4)
            </h3>
            <p className="text-xs text-gray-500">
              Publishing governance policy for Al Amin Edu Oasis marketing staff.
            </p>

            <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-800">
                  Require Owner Approval Before Scheduling
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  When enabled, all new content created by marketing staff remains in "Pending Approval" status until reviewed and approved by the Owner.
                </p>
              </div>

              <input
                type="checkbox"
                checked={systemForm.require_approval_before_scheduling}
                onChange={(e) =>
                  setSystemForm({
                    ...systemForm,
                    require_approval_before_scheduling: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-[#0E9F9A] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Official Contact Links (BOT-04, BOT-08) */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 space-y-4">
            <h3 className="text-sm font-heading font-bold text-gray-800">
              Official Institution Channels (BOT-04, BOT-08)
            </h3>
            <p className="text-xs text-gray-500">
              This official contact info is referenced by the Oasis Chatbot whenever an inquiry is outside the verified FAQ knowledge base.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official WhatsApp Direct Link (URL)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={systemForm.official_whatsapp}
                    onChange={(e) =>
                      setSystemForm({ ...systemForm, official_whatsapp: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30"
                  />
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Display WhatsApp Number
                </label>
                <input
                  type="text"
                  value={systemForm.official_whatsapp_number}
                  onChange={(e) =>
                    setSystemForm({ ...systemForm, official_whatsapp_number: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={systemForm.official_email}
                    onChange={(e) =>
                      setSystemForm({ ...systemForm, official_email: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Office Operating Hours
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={systemForm.operating_hours}
                    onChange={(e) =>
                      setSystemForm({ ...systemForm, operating_hours: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30"
                  />
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Main Campus Physical Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={systemForm.official_address}
                    onChange={(e) =>
                      setSystemForm({ ...systemForm, official_address: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30"
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: User Management (PRD AUTH-02 / AUTH-03) */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-semibold border-b">
              <tr>
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Current Role</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/70">
                  <td className="p-3.5 flex items-center gap-2.5">
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{user.full_name}</p>
                      <span className="text-[10px] text-gray-400">ID: {user.id}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-gray-600">{user.email}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        user.role === 'owner'
                          ? 'bg-[#E3F6F5] text-[#0A726F]'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {user.role === 'owner' ? '👑 Owner' : '💼 Marketing Staff'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        user.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {user.id !== currentUser.id && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            onUpdateUserRole(user.id, {
                              role: user.role === 'owner' ? 'marketing_staff' : 'owner',
                            })
                          }
                          className="text-[11px] text-[#0E9F9A] hover:underline font-semibold cursor-pointer"
                        >
                          Switch to {user.role === 'owner' ? 'Staff' : 'Owner'}
                        </button>
                        <button
                          onClick={() =>
                            onUpdateUserRole(user.id, { is_active: !user.is_active })
                          }
                          className="text-[11px] text-gray-500 hover:text-red-500 cursor-pointer"
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Activity Audit Logs (AUTH-08) */}
      {activeTab === 'logs' && (
        <div className="glass-card rounded-2xl p-4 border border-white/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Security Audit Trail (AUTH-08)
            </h3>
            <span className="text-[11px] text-gray-400">
              Tracks which team members created, modified, or deleted records
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between text-xs">
                <div>
                  <p className="font-semibold text-gray-800">
                    <span className="text-[#0E9F9A]">{log.user_name}:</span> {log.action}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-3">
                  {new Date(log.created_at).toLocaleString('en-US')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Invite New Staff */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-heading font-bold text-[#0A726F]">
                Invite Marketing Team Member
              </h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Siti Nurhaliza"
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. siti@alaminedu.com.my"
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assigned Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs outline-none"
                >
                  <option value="marketing_staff">Marketing Staff (Dashboard, Library, Calendar)</option>
                  <option value="owner">Owner (Full Admin Access)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
