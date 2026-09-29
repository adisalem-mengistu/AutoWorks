import { Zap, Briefcase, Users, Mail, User, LogOut, LogIn } from 'lucide-react';
import type { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  user: { displayName?: string | null; email?: string | null } | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'jobs',    label: 'Job Generator',   icon: <Briefcase size={16} /> },
  { id: 'leads',   label: 'Lead Prospector', icon: <Users size={16} /> },
  { id: 'compose', label: 'Cold-Pitch',      icon: <Mail size={16} /> },
  { id: 'profile', label: 'My Profile',      icon: <User size={16} /> },
];

export default function Navbar({ activeTab, onTabChange, user, onAuthClick, onLogout }: NavbarProps) {
  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500 p-1.5 rounded-lg">
            <Zap size={18} className="text-gray-950" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">
            FlutterApply <span className="text-cyan-400">AI Pro</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="hidden sm:flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-gray-400 text-xs hidden sm:block truncate max-w-[120px]">
                {user.displayName ?? user.email}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1.5 rounded-md hover:bg-red-500/10"
              >
                <LogOut size={14} />
                <span className="hidden sm:block">Sign out</span>
              </button>
            </>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-md transition-colors font-medium"
            >
              <LogIn size={14} />
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="sm:hidden flex border-t border-gray-800 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-500'
            }`}
          >
            {tab.icon}
            {tab.label.split(' ')[0]}
          </button>
        ))}
      </div>
    </nav>
  );
}
