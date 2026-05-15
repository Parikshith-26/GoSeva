import React from 'react';
import { LogOut, User, Globe, Bell, Shield, Info, ArrowLeft, ChevronRight, Moon, Sun, Monitor, Database } from 'lucide-react';
import { Card, Button } from '@/components/ui/common';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { seedCattleData } from '@/lib/seedData';

export default function Settings() {
  const { profile, user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isSeeding, setIsSeeding] = React.useState(false);
  const navigate = useNavigate();

  const handleSeedData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      await seedCattleData(user.uid);
      alert('10 sample cattle records with history have been added successfully!');
    } catch (error) {
      console.error('Failed to seed data:', error);
      alert('Failed to seed data. Check console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const themes = [
    { id: 'light', label: 'Light', icon: <Sun size={18} /> },
    { id: 'dark', label: 'Dark', icon: <Moon size={18} /> },
    { id: 'system', label: 'System', icon: <Monitor size={18} /> },
  ] as const;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-stone-400">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-display font-bold text-stone-900">Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="flex items-center gap-4 bg-primary text-white border-none p-5">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white ring-4 ring-white/10">
            <User size={32} />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg leading-tight">{profile?.name}</h3>
            <p className="text-white/60 text-sm">{profile?.farmName}</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
            <ChevronRight size={24} />
          </Button>
        </Card>

        {/* Menu Sections */}
        <div className="space-y-4">
          <section className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-4 mb-1">Appearance</h4>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95",
                    theme === t.id 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-white border-stone-100 text-stone-500 hover:border-stone-200 dark:bg-dark-card dark:border-dark-border"
                  )}
                >
                  {t.icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-4 mb-2">Preferences</h4>
            <div className="space-y-1">
              <MenuButton icon={<Globe size={18} />} label="Language" value="English (EN)" />
              <MenuButton icon={<Bell size={18} />} label="Notifications" value="Enabled" />
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-4 mb-2">Support & Legal</h4>
            <div className="space-y-1">
              <MenuButton icon={<Shield size={18} />} label="Privacy Policy" />
              <MenuButton icon={<Info size={18} />} label="About GoSeva" value="v1.0.0" />
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-4 mb-2">Developer Tools</h4>
            <div className="space-y-1">
              <button 
                onClick={handleSeedData}
                disabled={isSeeding}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-50 hover:bg-stone-50 transition-all active:scale-98 disabled:opacity-50 dark:bg-dark-card dark:border-dark-border"
              >
                <div className="flex items-center gap-3">
                  <div className="text-secondary">
                    <Database size={18} />
                  </div>
                  <span className="font-bold text-stone-700 text-sm uppercase tracking-wide dark:text-stone-300">
                    {isSeeding ? 'Seeding Data...' : 'Seed 10 Sample Records'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">With History</span>
                  <ChevronRight size={16} className="text-stone-300" />
                </div>
              </button>
            </div>
          </section>
        </div>

        <div className="pt-4 px-2">
          <Button 
            variant="outline" 
            className="w-full h-14 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-3"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Log Out Account
          </Button>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-50 hover:bg-stone-50 transition-all active:scale-98">
      <div className="flex items-center gap-3">
        <div className="text-stone-400">
          {icon}
        </div>
        <span className="font-bold text-stone-700 text-sm uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs font-medium text-stone-400">{value}</span>}
        <ChevronRight size={16} className="text-stone-300" />
      </div>
    </button>
  );
}
