import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Milk, Syringe, TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import { Card, Button } from '@/components/ui/common';
import { useCattleData } from '@/hooks/useCattleData';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, cn } from '@/lib/utils';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { cattle, recentYields, pendingVaccinations, todayYield, loading } = useCattleData();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-primary">
          <TrendingUp size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-stone-900">Welcome to GoSeva</h2>
          <p className="text-stone-500 mt-2">Sign in to track your cattle health and milk yield.</p>
        </div>
        <Button onClick={() => navigate('/login')} className="w-full">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-stone-900">Hello, {profile?.name || 'Farmer'}</h2>
          <p className="text-stone-500 text-sm">Here's your farm summary for today</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-2 bg-primary/5 border-primary/10">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Milk size={20} />
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-primary">{todayYield.toFixed(1)}L</p>
            <p className="text-xs font-semibold text-primary/60 uppercase">Today's Milk</p>
          </div>
        </Card>
        <Card className="flex flex-col gap-2 bg-stone-900 text-white">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-3xl font-display font-bold">{cattle.length}</p>
            <p className="text-xs font-semibold text-white/60 uppercase">Total Cattle</p>
          </div>
        </Card>
      </div>

      {/* Action Tabs */}
      <div className="grid grid-cols-3 gap-2">
        <ActionButton 
          icon={<Plus size={20} />} 
          label="Add Milk" 
          onClick={() => navigate('/milk-entry')}
          color="bg-primary/10 text-primary"
        />
        <ActionButton 
          icon={<Plus size={20} />} 
          label="Add Cow" 
          onClick={() => navigate('/cattle/new')}
          color="bg-accent/10 text-accent"
        />
        <ActionButton 
          icon={<TrendingUp size={20} />} 
          label="Analytics" 
          onClick={() => navigate('/analytics')}
          color="bg-blue-500/10 text-blue-500"
        />
      </div>

      {/* Alerts */}
      {pendingVaccinations.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-stone-900">Upcoming Vaccinations</h3>
            <button onClick={() => navigate('/alerts')} className="text-primary text-xs font-bold uppercase tracking-wider">See All</button>
          </div>
          <div className="space-y-2">
            {pendingVaccinations.slice(0, 2).map(v => {
              const c = cattle.find(cat => cat.id === v.cattleId);
              return (
                <Card key={v.id} className="flex items-center justify-between p-3 border-l-4 border-l-accent">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/5 flex items-center justify-center rounded-full text-accent">
                      <Syringe size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-sm">{v.vaccineName}</p>
                      <p className="text-xs text-stone-500">{c?.name || 'Cattle'} • Due {formatDate(v.nextDueDate)}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-stone-300" />
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="space-y-3">
        <h3 className="font-display font-bold text-stone-900">Recent Activity</h3>
        <Card className="divide-y divide-stone-50 p-0">
          {recentYields.length > 0 ? (
            recentYields.slice(0, 3).map(y => (
              <div key={y.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-stone-400">
                    <Milk size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">Milk Logged</p>
                    <p className="text-xs text-stone-500">{formatDate(y.date)} • {y.total} Liters</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-stone-300" />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-stone-400 text-sm italic">No recent activity</div>
          )}
        </Card>
      </section>

      {/* AI Recommendation Placeholder */}
      <Card className="bg-gradient-to-br from-primary to-green-800 text-white border-none p-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-white/80" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">AI Insight</span>
          </div>
          <p className="font-display font-medium text-lg leading-snug">
            Cattle #42 production is down by 15%. Consider checking feed quality or room temperature.
          </p>
          <button className="text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 transition-all mt-2">
            View Analysis
          </button>
        </div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </Card>
    </div>
  );
}

function ActionButton({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-all active:scale-95",
        color
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
