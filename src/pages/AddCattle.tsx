import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ShieldCheck, Tag, Info } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, Input } from '@/components/ui/common';
import { cn } from '@/lib/utils';

export default function AddCattle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    earTagId: '',
    breed: '',
    dateOfBirth: '',
    gender: 'female' as 'male' | 'female',
    status: 'healthy' as 'healthy' | 'sick' | 'pregnant' | 'sold' | 'deceased',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await db.cattle.add({
        ...formData,
        ownerId: user.uid,
        createdAt: Date.now(),
      });
      navigate('/cattle');
    } catch (error) {
      console.error('Failed to register cattle:', error);
      alert('Failed to register cattle locally.');
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
        <h2 className="text-2xl font-display font-bold text-stone-900">Register Cattle</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        {/* Photo Upload Placeholder */}
        <div className="w-full aspect-square bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-4 text-stone-400 hover:bg-stone-50 transition-all cursor-pointer">
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
            <Camera size={32} className="text-stone-300" />
          </div>
          <span className="font-bold text-xs uppercase tracking-widest">Capture Photo</span>
        </div>

        <Card className="space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={16} className="text-primary" />
            <h3 className="font-display font-bold text-stone-900">Cattle Identity</h3>
          </div>
          
          <Input 
            label="Ear Tag ID" 
            placeholder="e.g. IND123456" 
            value={formData.earTagId}
            onChange={e => setFormData({ ...formData, earTagId: e.target.value })}
            required 
          />
          <Input 
            label="Name / Nickname" 
            placeholder="e.g. Ganga" 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required 
          />
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'female' })}
              className={cn(
                "p-4 rounded-2xl border font-bold text-sm transition-all",
                formData.gender === 'female' ? "bg-primary border-primary text-white" : "bg-stone-50 border-stone-100 text-stone-600"
              )}
            >
              Female (Cow)
            </button>
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, gender: 'male' })}
              className={cn(
                "p-4 rounded-2xl border font-bold text-sm transition-all",
                formData.gender === 'male' ? "bg-primary border-primary text-white" : "bg-stone-50 border-stone-100 text-stone-600"
              )}
            >
              Male (Bull)
            </button>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-blue-500" />
            <h3 className="font-display font-bold text-stone-900">Additional Info</h3>
          </div>
          
          <Input 
            label="Breed" 
            placeholder="e.g. Gir, Holstein" 
            value={formData.breed}
            onChange={e => setFormData({ ...formData, breed: e.target.value })}
            required 
          />
          <Input 
            label="Date of Birth" 
            type="date" 
            value={formData.dateOfBirth}
            onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required 
          />
        </Card>

        <div className="flex gap-4 sticky bottom-6 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 rounded-2xl h-14 bg-white"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-[2] rounded-2xl h-14 shadow-lg shadow-primary/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : (
              <>
                <ShieldCheck size={20} />
                Complete Registration
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
