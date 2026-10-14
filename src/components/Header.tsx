import React, { useState } from 'react';
import {
  Bell,
  Search,
  ShieldCheck,
  User,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';
import { Logo } from './Logo.tsx';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  onLogout: () => void;
  onResetDb: () => void;
  onSearchGlobal?: (query: string) => void;
  notificationCount?: number;
  missedEntriesCount?: number;
  pendingApprovalCount?: number;
  onOpenPendingApprovals?: () => void;
  onOpenMissedEntries?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  onLogout,
  onResetDb,
  onSearchGlobal,
  notificationCount = 3,
  missedEntriesCount = 1,
  pendingApprovalCount = 1,
  onOpenPendingApprovals,
  onOpenMissedEntries,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const isOwner = currentUser.role === 'owner';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchGlobal) onSearchGlobal(searchVal);
  };

  return (
    <header className="glass-header sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile brand display */}
      <div className="flex md:hidden items-center">
        <Logo size="sm" />
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search content titles, copy, campaigns, or tags..."
            className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-md border border-[#0E9F9A]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9F9A]/40 focus:bg-white transition-all shadow-inner text-[#1F2A2A] placeholder-gray-400"
          />
          <Search className="w-4 h-4 text-[#0E9F9A] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Right Action Icons & User Switcher */}
      <div className="flex items-center gap-3">
        {/* Reset Dummy DB Button */}
        <button
          onClick={onResetDb}
          title="Reset database to default seed state"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0A726F] bg-[#E3F6F5] hover:bg-[#d0f0ee] border border-[#0E9F9A]/30 rounded-lg transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset DB</span>
        </button>

        {/* Notifications Dropdown (DASH-08 alerts) */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-gray-600 hover:text-[#0E9F9A] hover:bg-white/80 transition-all border border-transparent hover:border-gray-200"
            title="Notifications & Alerts"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E5484D] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-modal rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-heading font-semibold text-sm text-[#0A726F]">
                  Notifications & Alerts (PRD DASH-08)
                </span>
                <span className="text-[11px] bg-[#E3F6F5] text-[#0E9F9A] px-2 py-0.5 rounded-full font-medium">
                  {notificationCount} Alerts
                </span>
              </div>

              <div className="mt-3 space-y-2.5">
                {missedEntriesCount > 0 && (
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      if (onOpenMissedEntries) onOpenMissedEntries();
                    }}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-red-50/80 border border-red-200/80 hover:bg-red-100/60 transition cursor-pointer text-xs"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#E5484D] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900">1 Missed Schedule Entry</p>
                      <p className="text-red-700 text-[11px]">
                        Threads post for "Multiplication Tips" has passed its scheduled time without being marked published.
                      </p>
                    </div>
                  </div>
                )}

                {pendingApprovalCount > 0 && (
                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      if (onOpenPendingApprovals) onOpenPendingApprovals();
                    }}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 hover:bg-amber-100/60 transition cursor-pointer text-xs"
                  >
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">Content Pending Approval</p>
                      <p className="text-amber-700 text-[11px]">
                        1 staff post requires Owner review & approval before it can be scheduled.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-900">Database Engine Connected</p>
                    <p className="text-emerald-700 text-[11px]">
                      PostgreSQL dummy store synchronized and active in real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher & Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 md:px-3 md:py-1.5 rounded-xl glass-card-subtle hover:bg-white transition border border-[#0E9F9A]/20"
          >
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.full_name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-[#0E9F9A]/30"
            />
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                {currentUser.full_name}
                {isOwner ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0E9F9A]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-blue-500" />
                )}
              </span>
              <span className="text-[10px] text-gray-500">
                {isOwner ? 'Owner (Admin)' : 'Marketing Staff'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 glass-modal rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 border-b border-gray-100">
                <p className="text-xs text-gray-500">Active User:</p>
                <p className="text-sm font-semibold text-[#0A726F]">{currentUser.full_name}</p>
                <p className="text-[11px] text-gray-400">{currentUser.email}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    isOwner ? 'bg-[#E3F6F5] text-[#0A726F]' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  Role: {isOwner ? 'Owner (Full Access)' : 'Marketing Staff (Settings Restricted)'}
                </span>
              </div>

              {/* Quick Role Switcher for Test Evaluation */}
              <div className="mt-2.5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
                  Switch Active Role (RBAC Simulation)
                </p>
                <div className="space-y-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                        u.id === currentUser.id
                          ? 'bg-[#E3F6F5] text-[#0A726F] font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar_url}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{u.full_name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 capitalize">
                        {u.role === 'owner' ? 'Owner' : 'Staff'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Log Out Button (PRD AUTH-05) */}
              <div className="mt-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of CMS</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
