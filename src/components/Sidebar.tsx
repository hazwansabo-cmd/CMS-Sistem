import React from 'react';
import {
  LayoutDashboard,
  Layers,
  CalendarDays,
  BarChart3,
  FolderArchive,
  Settings,
  Lock,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { UserProfile } from '../types/index.ts';

export type NavTab =
  | 'dashboard'
  | 'library'
  | 'raw_content'
  | 'calendar'
  | 'analytics'
  | 'settings'
  | 'public_chatbot';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  pendingApprovalsCount?: number;
  rawContentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  pendingApprovalsCount = 0,
  rawContentCount = 0,
}) => {
  const isOwner = currentUser.role === 'owner';

  const menuItems: { id: NavTab; label: string; icon: any; ownerOnly?: boolean; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'library',
      label: 'Content Library',
      icon: Layers,
      badge: pendingApprovalsCount,
    },
    {
      id: 'raw_content',
      label: 'Raw Content (Footage)',
      icon: FolderArchive,
      badge: rawContentCount > 0 ? rawContentCount : undefined,
    },
    {
      id: 'calendar',
      label: 'Editorial Calendar',
      icon: CalendarDays,
    },
    {
      id: 'analytics',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings & Staff',
      icon: Settings,
      ownerOnly: true,
    },
  ];

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-xl border-r border-[#0E9F9A]/15 flex flex-col justify-between h-screen sticky top-0 z-40 select-none shadow-sm">
      {/* Top Section */}
      <div>
        {/* Logo and Institution Header */}
        <div className="p-5 border-b border-gray-100/80">
          <Logo size="md" />
        </div>

        {/* Navigation Menu (PRD Section 7.4) */}
        <nav className="p-3 space-y-1.5 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const isRestricted = item.ownerOnly && !isOwner;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isRestricted) {
                    alert('Access Restricted: The Settings & User Management module is restricted to Owner role accounts only (PRD AUTH-02 / Section 12).');
                    return;
                  }
                  onSelectTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-[#0E9F9A] text-white shadow-md shadow-[#0E9F9A]/25'
                    : isRestricted
                    ? 'text-gray-400 hover:bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'text-gray-600 hover:text-[#0A726F] hover:bg-[#E3F6F5]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : isRestricted ? 'text-gray-400' : 'text-[#0E9F9A]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {isRestricted ? (
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                ) : item.badge && item.badge > 0 ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-[#0E9F9A]' : 'bg-[#E5484D] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Participant Public Chatbot Preview + Role Badge */}
      <div className="p-4 border-t border-gray-100/80 space-y-3">
        {/* Public Chatbot Tester Banner */}
        <div
          onClick={() => onSelectTab('public_chatbot')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            currentTab === 'public_chatbot'
              ? 'bg-[#E3F6F5] border-[#0E9F9A] text-[#0A726F]'
              : 'bg-[#F5F8F8] border-gray-200/80 hover:border-[#0E9F9A]/50 text-gray-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0E9F9A] text-white flex items-center justify-center shadow-sm">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold">Public Participant View</p>
                <p className="text-[10px] text-gray-500">Test Oasis Chatbot</p>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#0E9F9A]" />
          </div>
        </div>

        {/* User Role Card */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50/80 border border-gray-200/60">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2E9E5B] ring-2 ring-emerald-100 animate-pulse flex-shrink-0" />
          <div className="text-[11px] leading-tight truncate">
            <p className="font-semibold text-gray-800 truncate">{currentUser.full_name}</p>
            <p className="text-gray-500 capitalize">
              {isOwner ? '👑 System Owner' : '💼 Marketing Staff'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
