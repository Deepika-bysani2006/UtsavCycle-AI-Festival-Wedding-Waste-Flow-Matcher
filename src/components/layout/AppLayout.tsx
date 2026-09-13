import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Leaf, Users, Truck, MessageSquare,
  LogOut, Menu, X, Bell, ChevronDown, BarChart2, Calendar,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const organizerNav: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/events', icon: <Calendar size={18} />, label: 'My Events' },
  { to: '/predict', icon: <Leaf size={18} />, label: 'Waste Prediction' },
  { to: '/partners', icon: <Users size={18} />, label: 'Find Partners' },
  { to: '/pickups', icon: <Truck size={18} />, label: 'Pickup Requests' },
  { to: '/assistant', icon: <MessageSquare size={18} />, label: 'AI Assistant' },
  { to: '/impact', icon: <BarChart2 size={18} />, label: 'Impact Report' },
];

const partnerNav: NavItem[] = [
  { to: '/partner-dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/partner-pickups', icon: <Truck size={18} />, label: 'Pickup Requests' },
  { to: '/assistant', icon: <MessageSquare size={18} />, label: 'AI Assistant' },
  { to: '/impact', icon: <BarChart2 size={18} />, label: 'Impact Report' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = userProfile?.role === 'RECOVERY_PARTNER' ? partnerNav : organizerNav;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={clsx(
      'flex flex-col bg-white dark:bg-[#1a2018] border-r border-gray-100 dark:border-[#2a3828] h-full',
      mobile ? 'w-full' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-[#2a3828]">
        <img src="/utsavcycle-logo.png" alt="UtsavCycle AI" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-bold text-[#1a6b2f] dark:text-green-400 text-sm leading-tight">UtsavCycle AI</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Turn waste into resources</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-2 bg-primary-50 dark:bg-green-900/20 mx-4 mt-4 rounded-xl">
        <p className="text-xs font-medium text-[#1a6b2f] dark:text-green-400">
          {userProfile?.role === 'RECOVERY_PARTNER' ? '♻️ Recovery Partner' : '🎪 Event Organizer'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary-50 dark:bg-green-900/20 text-[#1a6b2f] dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1f2d1d] hover:text-[#1a6b2f] dark:hover:text-green-400'
            )}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 pb-6 mt-4 border-t border-gray-100 dark:border-[#2a3828] pt-4">
        <div className="flex items-center gap-3">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-bold">
              {(userProfile?.name?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{currentUser?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#f8faf5] dark:bg-[#0d1510] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full shadow-xl z-10">
            <Sidebar mobile />
          </div>
          <button className="absolute top-4 right-4 z-20 text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-[#1a2018] border-b border-gray-100 dark:border-[#2a3828] px-4 md:px-6 py-3 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-600 dark:text-gray-400" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <img src="/utsavcycle-logo.png" alt="" className="w-7 h-7 rounded-full object-cover" />
              <span className="font-bold text-brand-green dark:text-green-400 text-sm">UtsavCycle AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-green-400 rounded-xl hover:bg-primary-50 dark:hover:bg-[#1f2d1d] transition-colors">
              <Bell size={18} />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-[#1f2d1d] transition-colors"
              >
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand-green text-white flex items-center justify-center text-xs font-bold">
                    {(userProfile?.name?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1a2018] rounded-xl shadow-card-hover dark:shadow-none border border-gray-100 dark:border-[#2a3828] py-2 z-50">
                  <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-[#2a3828]">{currentUser?.email}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8faf5] dark:bg-[#0d1510]">
          {children}
        </main>
      </div>
    </div>
  );
}
