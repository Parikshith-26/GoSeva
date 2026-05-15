import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, ClipboardList, Info as ChartIcon, Bell, Settings, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen pb-20 max-w-md mx-auto relative bg-stone-50 border-x border-stone-100 dark:bg-dark-surface dark:border-dark-border">
      <header className="p-4 bg-white border-b border-stone-100 sticky top-0 z-50 dark:bg-dark-card dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg text-primary leading-tight">GoSeva</h1>
              <div className="flex items-center gap-2">
                {!isOnline && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-orange-500 uppercase tracking-tighter">
                    <WifiOff size={10} />
                    Offline (Local Storage Active)
                  </div>
                )}
              </div>
            </div>
          </div>
          <button id="notification-btn" className="p-2 text-stone-500 hover:text-primary transition-colors dark:text-stone-400 dark:hover:text-primary">
            <Bell size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-stone-100 px-2 py-3 z-50 dark:bg-dark-card dark:border-dark-border">
        <div className="flex items-center justify-around">
          <NavItem to="/dashboard" icon={<Home size={24} />} label="Home" />
          <NavItem to="/cattle" icon={<ClipboardList size={24} />} label="Cattle" />
          <NavItem to="/analytics" icon={<ChartIcon size={24} />} label="Stats" />
          <NavItem to="/alerts" icon={<Bell size={24} />} label="Alerts" />
          <NavItem to="/settings" icon={<Settings size={24} />} label="Settings" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
          isActive ? "text-primary bg-primary/5 dark:bg-primary/10" : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
        )
      }
    >
      {icon}
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </NavLink>
  );
}
