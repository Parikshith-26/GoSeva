import React, { useState } from 'react';
import { X, Save, Baby } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Input } from '@/components/ui/common';
import { cn } from '@/lib/utils';

interface AddBreedingModalProps {
  cattleId: string | number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBreedingModal({ cattleId, onClose, onSuccess }: AddBreedingModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    heatStartDate: new Date().toISOString().split('T')[0],
    breedingDate: '',
    bullName: '',
    status: 'heat' as 'heat' | 'bred' | 'pregnant' | 'heat-missed',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await db.breedingCycles.add({
        ...formData,
        cattleId,
        ownerId: user.uid,
        createdAt: Date.now(),
      });
      
      // If marked as pregnant, update cattle status
      if (formData.status === 'pregnant') {
        await db.cattle.update(Number(cattleId), { status: 'pregnant' });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save breeding cycle:', error);
      alert('Failed to save record locally.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Baby className="text-primary" size={20} />
            <h3 className="text-xl font-display font-bold text-stone-900">Log Breeding Cycle</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Heat Start Date"
            type="date"
            value={formData.heatStartDate}
            onChange={(e) => setFormData({ ...formData, heatStartDate: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Breeding Date (Optional)"
              type="date"
              value={formData.breedingDate}
              onChange={(e) => setFormData({ ...formData, breedingDate: e.target.value })}
            />
            <Input
              label="Bull Name / ID"
              placeholder="e.g. Nandi-01"
              value={formData.bullName}
              onChange={(e) => setFormData({ ...formData, bullName: e.target.value })}
            />
          </div>

          <div className="space-y-1.5 scroll-pb-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 ml-1">Current Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(['heat', 'bred', 'pregnant', 'heat-missed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s })}
                  className={cn(
                    "py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all",
                    formData.status === s
                      ? "bg-primary border-primary text-white"
                      : "bg-stone-50 border-stone-100 text-stone-500 hover:border-stone-200"
                  )}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 ml-1">Notes</label>
            <textarea
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm min-h-[80px]"
              placeholder="Any observations..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-[2]" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Record
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
