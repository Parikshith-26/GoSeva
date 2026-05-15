import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Milk, ArrowLeft, Save } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import { useCattleData } from '@/hooks/useCattleData';
import { Button, Card, Input } from '@/components/ui/common';
import { cn } from '@/lib/utils';

export default function MilkEntry() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cattle } = useCattleData();
  
  const [selectedCattleId, setSelectedCattleId] = useState<string | number>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [morning, setMorning] = useState('0');
  const [evening, setEvening] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCattleId) return;

    setIsSubmitting(true);
    try {
      const m = parseFloat(morning) || 0;
      const ev = parseFloat(evening) || 0;
      const total = m + ev;

      await db.milkYields.add({
        cattleId: selectedCattleId,
        ownerId: user.uid,
        date,
        morning: m,
        evening: ev,
        total,
        createdAt: Date.now(),
      });

      // Update cattle last yield
      await db.cattle.update(Number(selectedCattleId), {
        lastMilkYield: total,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save milk entry:', error);
      alert('Failed to save record locally.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-stone-400">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-display font-bold text-stone-900">Milk Entry</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-4">
          <div className="space-y-1.5 border-b border-stone-100 pb-4 mb-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 ml-1">Select Cattle</label>
            <div className="grid grid-cols-2 gap-2">
              {cattle.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCattleId(c.id)}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-bold transition-all text-left truncate",
                    selectedCattleId === c.id 
                      ? "bg-primary border-primary text-white" 
                      : "bg-stone-50 border-stone-100 text-stone-600 hover:border-stone-200"
                  )}
                >
                  {c.name} <span className="block text-[10px] font-normal opacity-70">#{c.earTagId}</span>
                </button>
              ))}
            </div>
            {cattle.length === 0 && (
              <p className="text-center py-4 text-stone-400 text-sm italic">No cattle registered. Please add cattle first.</p>
            )}
          </div>

          <div className="space-y-4">
            <Input 
              type="date" 
              label="Date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
            />

            <div className="grid grid-cols-2 gap-3">
              <Input 
                type="number" 
                step="0.1" 
                label="Morning (L)" 
                value={morning} 
                onChange={(e) => setMorning(e.target.value)} 
                required 
              />
              <Input 
                type="number" 
                step="0.1" 
                label="Evening (L)" 
                value={evening} 
                onChange={(e) => setEvening(e.target.value)} 
                required 
              />
            </div>
          </div>
        </Card>

        <div className="bg-stone-900 rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Total Yield</p>
            <p className="text-4xl font-display font-bold">{(parseFloat(morning) || 0) + (parseFloat(evening) || 0)} L</p>
          </div>
          <Milk size={40} className="text-white/20" />
        </div>

        <Button 
          type="submit" 
          className="w-full h-16 text-lg tracking-wide rounded-2xl shadow-lg shadow-primary/20"
          disabled={!selectedCattleId || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (
            <>
              <Save size={20} />
              Save Record
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
