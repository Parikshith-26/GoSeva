import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Syringe, Baby, AlertCircle, ChevronRight, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { Card, Button } from '@/components/ui/common';
import { useCattleData } from '@/hooks/useCattleData';
import { formatDate } from '@/lib/utils';
import { getHerdAlerts } from '@/services/gemini';

export default function Alerts() {
  const { pendingVaccinations, cattle, recentYields } = useCattleData();
  const navigate = useNavigate();
  const [herdInsights, setHerdInsights] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateHerdInsights = async () => {
    if (cattle.length === 0) return;
    setIsGenerating(true);
    try {
      const insights = await getHerdAlerts(cattle, recentYields);
      setHerdInsights(insights);
    } catch (error) {
      console.error("Failed to generate herd insights:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
       <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-stone-400">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-display font-bold text-stone-900">Alerts & Insights</h2>
      </div>

      <div className="space-y-6">
        {/* AI Herd Insights Section */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-500" />
            AI Herd Intelligence
          </h3>
          <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none p-5 relative overflow-hidden shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles size={100} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Performance & Health Analysis</p>
                <button 
                  onClick={generateHerdInsights}
                  disabled={isGenerating}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                </button>
              </div>

              {herdInsights ? (
                <div className="space-y-2 prose prose-invert prose-sm max-w-none">
                  <p className="text-indigo-50 font-medium leading-relaxed">
                    {herdInsights}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-indigo-100/90 text-sm leading-relaxed">
                    Get AI-powered health alerts and breeding pattern analysis for your entire herd based on recent data.
                  </p>
                  <Button 
                    onClick={generateHerdInsights}
                    disabled={isGenerating || cattle.length === 0}
                    className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs h-10 uppercase tracking-widest shadow-lg"
                  >
                    {isGenerating ? 'Analyzing Herd Data...' : 'Analyze My Herd'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </section>

        {pendingVaccinations.length > 0 ? (
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
              <Syringe size={14} className="text-accent" />
              Vaccination Reminders
            </h3>
            <div className="space-y-2">
              {pendingVaccinations.map(v => {
                const c = cattle.find(cat => cat.id === v.cattleId);
                return (
                  <Card key={v.id} className="p-4 flex items-center justify-between border-l-4 border-l-accent">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/5 rounded-full flex items-center justify-center text-accent">
                        <Syringe size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 leading-none">{v.vaccineName}</p>
                        <p className="text-xs text-stone-500 mt-1">{c?.name || 'Cattle'} • Due {formatDate(v.nextDueDate)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-stone-300">
                      <ChevronRight size={20} />
                    </Button>
                  </Card>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-stone-200">
             <Bell size={32} className="mx-auto text-stone-200 mb-2" />
             <p className="text-stone-400 text-sm">No pending vaccinations</p>
          </div>
        )}

        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
             <Baby size={14} className="text-blue-500" />
             Breeding Alerts
          </h3>
          <Card className="bg-blue-50/50 border-blue-100 flex items-start gap-4 p-4 grayscale opacity-50">
             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shrink-0">
                <AlertCircle size={20} />
             </div>
             <div>
                <p className="font-bold text-stone-800 text-sm">No Heat Prediction</p>
                <p className="text-xs text-stone-500 mt-1">Predictions will appear once you log at least two heat cycles.</p>
             </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
