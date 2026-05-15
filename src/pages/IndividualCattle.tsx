import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Plus, Milk, Syringe, 
  Baby, Activity, ChevronRight, Calendar,
  Sparkles, RefreshCw, Trash2
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Cattle, MilkYield, Vaccination, BreedingCycle } from '@/types';
import { Card, Button, StatusBadge } from '@/components/ui/common';
import { formatDate, cn } from '@/lib/utils';
import AddVaccinationModal from '@/components/forms/AddVaccinationModal';
import AddBreedingModal from '@/components/forms/AddBreedingModal';
import { getCattleHealthInsights } from '@/services/gemini';
import { useAuth } from '@/hooks/useAuth';

type Tab = 'overview' | 'milk' | 'health' | 'breeding';

export default function IndividualCattle() {
  const { id } = useParams<{ id: string }>();
  const cattleId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Use Dexie live queries for real-time reactivity
  const cattle = useLiveQuery(() => db.cattle.get(cattleId), [cattleId]);
  
  const milkYields = useLiveQuery(
    () => db.milkYields
      .where('cattleId').equals(id || '')
      .or('cattleId').equals(cattleId)
      .reverse()
      .limit(10)
      .toArray(),
    [id, cattleId]
  ) || [];

  const vaccinations = useLiveQuery(
    () => db.vaccinations
      .where('cattleId').equals(id || '')
      .or('cattleId').equals(cattleId)
      .toArray(),
    [id, cattleId]
  ) || [];

  const breedingCycles = useLiveQuery(
    () => db.breedingCycles
      .where('cattleId').equals(id || '')
      .or('cattleId').equals(cattleId)
      .reverse()
      .toArray(),
    [id, cattleId]
  ) || [];

  const healthRecords: any[] = []; // Placeholder for now

  const generateInsights = async () => {
    if (!cattle) return;
    setIsGeneratingInsights(true);
    try {
      const insights = await getCattleHealthInsights(cattle as any, milkYields as any, healthRecords);
      setAiInsights(insights);
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleDeleteCattle = async () => {
    if (!id || !user) return;
    setIsDeleting(true);
    try {
      await db.cattle.delete(cattleId);
      // Also delete related records
      await db.milkYields.where('cattleId').equals(id).or('cattleId').equals(cattleId).delete();
      await db.vaccinations.where('cattleId').equals(id).or('cattleId').equals(cattleId).delete();
      await db.breedingCycles.where('cattleId').equals(id).or('cattleId').equals(cattleId).delete();
      navigate('/cattle');
    } catch (error) {
      console.error('Failed to delete cattle:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!cattle && !isDeleting) return <div className="p-8 text-center text-stone-400">Loading Profile...</div>;
  if (!cattle && isDeleting) return <div className="p-8 text-center text-stone-400">Deleting...</div>;
  if (!cattle) return <div className="p-8 text-center text-stone-400">Cattle not found</div>;

  return (
    <div className="min-h-screen bg-stone-50 pb-24 dark:bg-dark-surface">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 p-4 sticky top-14 z-40 flex items-center justify-between dark:bg-dark-card dark:border-dark-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/cattle')} className="p-1 text-stone-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="font-display font-bold text-lg leading-none">{cattle.name}</h3>
            <p className="text-xs text-stone-500 mt-1">#{cattle.earTagId} • {cattle.breed}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-stone-400">
            <Edit size={18} />
          </button>
          <button 
            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-4 bg-white border-b border-stone-100 dark:bg-dark-card dark:border-dark-border">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-stone-100 rounded-2xl overflow-hidden border border-stone-100 shrink-0 dark:bg-stone-800 dark:border-dark-border">
            {cattle.photoUrl ? (
              <img src={cattle.photoUrl} alt={cattle.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <Plus size={32} />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-2">
            <div className="flex gap-2">
              <StatusBadge status={cattle.status} className="h-6 px-3 text-[10px]" />
              <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase tracking-wider h-6 flex items-center">
                {cattle.gender}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
              <Calendar size={14} />
              <span>Born: {formatDate(cattle.dateOfBirth)}</span>
            </div>
            <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mt-1">
              Registered on {formatDate(cattle.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-100 flex overflow-x-auto no-scrollbar px-2 sticky top-[118px] z-40 dark:bg-dark-card dark:border-dark-border">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
        <TabButton active={activeTab === 'milk'} onClick={() => setActiveTab('milk')} label="Milk" />
        <TabButton active={activeTab === 'health'} onClick={() => setActiveTab('health')} label="Health" />
        <TabButton active={activeTab === 'breeding'} onClick={() => setActiveTab('breeding')} label="Breeding" />
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* AI Insights Card */}
            <Card className="bg-gradient-to-br from-primary to-green-800 text-white border-none p-5 relative overflow-hidden shadow-xl shadow-primary/10">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <Sparkles size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                      <Sparkles size={16} />
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">AI Cattle Insight</h4>
                  </div>
                  <button 
                    onClick={generateInsights}
                    disabled={isGeneratingInsights}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isGeneratingInsights ? "animate-spin" : ""} />
                  </button>
                </div>
                
                {aiInsights ? (
                  <div className="space-y-2">
                    <p className="font-display font-medium text-lg leading-snug">
                      {aiInsights}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-white/80 text-sm leading-relaxed">
                      Analyze performance trends and health indicators for {cattle.name}.
                    </p>
                    <Button 
                      onClick={generateInsights}
                      disabled={isGeneratingInsights}
                      variant="outline" 
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 text-[10px] h-9 uppercase font-bold tracking-widest"
                    >
                      {isGeneratingInsights ? 'Analyzing...' : 'Generate AI Report'}
                    </Button>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={<Milk className="text-primary" size={20} />} label="Last Yield" value={cattle.lastMilkYield ? `${cattle.lastMilkYield}L` : '—'} />
              <StatCard icon={<Activity className="text-blue-500" size={20} />} label="Health Score" value="8.5/10" />
            </div>
            
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-stone-900">Recent Logs</h4>
                <button className="text-primary text-xs font-bold uppercase">View Logs</button>
              </div>
              <Card className="divide-y divide-stone-50 p-0 overflow-hidden dark:divide-stone-900">
                {milkYields.slice(0, 3).map(y => (
                  <div key={y.id} className="p-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-600">{formatDate(y.date)}</span>
                    <span className="font-bold text-primary">{y.total} Liters</span>
                  </div>
                ))}
              </Card>
            </section>
          </div>
        )}

        {activeTab === 'milk' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-stone-900">Production History</h4>
              <Button size="sm" className="rounded-lg h-8 text-[10px] uppercase font-bold" onClick={() => navigate('/milk-entry')}>
                Log Entry
              </Button>
            </div>
            <div className="space-y-2">
              {milkYields.map(y => (
                <Card key={y.id} className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <p className="font-bold text-stone-900 text-sm">{formatDate(y.date)}</p>
                    <p className="text-[10px] text-stone-500 font-medium">M: {y.morning}L • E: {y.evening}L</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg leading-none">{y.total}L</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter mt-1">Total</p>
                    </div>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Delete this milk log?')) {
                          try {
                            await db.milkYields.delete(Number(y.id));
                          } catch (e) {
                            console.error('Failed to delete milk log:', e);
                          }
                        }
                      }}
                      className="p-1.5 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-stone-900">Vaccinations</h4>
              <Button size="sm" className="rounded-lg h-8 text-[10px] uppercase font-bold" onClick={() => setShowVaccinationModal(true)}>
                Add New
              </Button>
            </div>

            {/* Scheduled/Upcoming */}
            {vaccinations.filter(v => v.status !== 'completed').length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Upcoming Schedule</p>
                <div className="space-y-2">
                  {vaccinations.filter(v => v.status !== 'completed').map(v => (
                    <Card key={v.id} className={cn(
                      "p-3 border-l-4",
                      v.status === 'overdue' ? "border-l-red-500" : "border-l-indigo-400"
                    )}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{v.vaccineName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                              <Calendar size={10} />
                              Due: {formatDate(v.nextDueDate)}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={v.status} />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Vaccination History</p>
              <div className="space-y-2">
                {vaccinations.filter(v => v.status === 'completed').length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-stone-200 dark:bg-dark-card dark:border-dark-border">
                    <p className="text-stone-400 text-xs">No past records found</p>
                  </div>
                ) : (
                  vaccinations.filter(v => v.status === 'completed').map(v => (
                    <Card key={v.id} className="p-3 border-l-4 border-l-green-500">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-bold text-stone-900 text-sm">{v.vaccineName}</p>
                          <div className="space-y-0.5">
                            {(v.dateAdministered || v.date) && (
                              <p className="text-[10px] text-stone-600 font-medium flex items-center gap-1">
                                <span className="text-stone-400 uppercase text-[9px]">Administered:</span> {formatDate(v.dateAdministered || v.date || '')}
                              </p>
                            )}
                            <p className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                              <span className="text-stone-400 uppercase text-[9px]">Next Due:</span> {formatDate(v.nextDueDate)}
                            </p>
                            {(v.veterinarian || v.administeredBy) && (
                              <p className="text-[10px] text-stone-600 font-medium flex items-center gap-1 mt-1 italic">
                                <Syringe size={10} className="text-stone-300" />
                                {v.veterinarian || v.administeredBy}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status="completed" />
                          <button 
                            onClick={async () => {
                              if (window.confirm('Delete this vaccination record?')) {
                                try {
                                  await db.vaccinations.delete(Number(v.id));
                                } catch (e) {
                                  console.error('Failed to delete vaccination:', e);
                                }
                              }
                            }}
                            className="text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'breeding' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-stone-900">Breeding Cycles</h4>
              <Button size="sm" className="rounded-lg h-8 text-[10px] uppercase font-bold" onClick={() => setShowBreedingModal(true)}>
                Add Cycle
              </Button>
            </div>
            {breedingCycles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-200 dark:bg-dark-card dark:border-dark-border">
                <Baby size={32} className="mx-auto text-stone-300 mb-2 dark:text-stone-700" />
                <p className="text-stone-400 text-sm">No breeding cycles recorded</p>
              </div>
            ) : (
              <div className="space-y-2">
                {breedingCycles.map(c => (
                  <Card key={c.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-stone-900 text-sm">Heat: {formatDate(c.heatStartDate)}</p>
                        <p className="text-[10px] text-stone-500">Status: {c.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={async () => {
                            if (window.confirm('Delete this breeding cycle?')) {
                              try {
                                await db.breedingCycles.delete(Number(c.id));
                              } catch (e) {
                                console.error('Failed to delete breeding cycle:', e);
                              }
                            }
                          }}
                          className="p-1.5 text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={16} className="text-stone-300" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-xl z-50 p-2" size="icon">
        <Plus size={28} />
      </Button>

      {showVaccinationModal && id && (
        <AddVaccinationModal 
          cattleId={id} 
          onClose={() => setShowVaccinationModal(false)}
          onSuccess={() => {}} 
        />
      )}

      {showBreedingModal && id && (
        <AddBreedingModal 
          cattleId={id} 
          onClose={() => setShowBreedingModal(false)}
          onSuccess={() => {}} 
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <Card className="w-full max-w-xs p-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto dark:bg-red-900/20">
              <Trash2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-stone-900">Delete Cattle?</h3>
              <p className="text-sm text-stone-500">
                This action cannot be undone. All data for <b>{cattle.name}</b> will be removed.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="primary" 
                className="bg-red-500 hover:bg-red-600 border-red-500 shadow-lg shadow-red-500/20"
                onClick={handleDeleteCattle}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 shrink-0",
        active ? "text-primary border-primary" : "text-stone-400 border-transparent"
      )}
    >
      {label}
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1 p-3">
      <div className="w-8 h-8 bg-stone-50 rounded-lg flex items-center justify-center mb-1 dark:bg-stone-900">
        {icon}
      </div>
      <p className="text-lg font-display font-bold text-stone-900 leading-none">{value}</p>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{label}</p>
    </Card>
  );
}
