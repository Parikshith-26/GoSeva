import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Input } from '@/components/ui/common';
import { cn } from '@/lib/utils';

interface AddVaccinationModalProps {
  cattleId: string | number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVaccinationModal({ cattleId, onClose, onSuccess }: AddVaccinationModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vaccineName: '',
    dateAdministered: '',
    nextDueDate: '',
    veterinarian: '',
    status: 'completed' as 'completed' | 'pending' | 'overdue',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await db.vaccinations.add({
        ...formData,
        cattleId,
        ownerId: user.uid,
        createdAt: Date.now(),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save vaccination:', error);
      alert('Failed to save record locally.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-stone-900">Add Vaccination</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Vaccine Name"
            placeholder="e.g. FMD Vaccine"
            value={formData.vaccineName}
            onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date Administered"
              type="date"
              value={formData.dateAdministered}
              onChange={(e) => setFormData({ ...formData, dateAdministered: e.target.value })}
            />
            <Input
              label="Next Due Date"
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Veterinarian"
            placeholder="e.g. Dr. Sharma"
            value={formData.veterinarian}
            onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
          />

          <div className="space-y-1.5 pb-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 ml-1">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(['completed', 'pending', 'overdue'] as const).map((s) => (
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
                  {s}
                </button>
              ))}
            </div>
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
