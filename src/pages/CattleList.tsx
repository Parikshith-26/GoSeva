import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, ChevronRight, MapPin, Trash2 } from 'lucide-react';
import { Card, Input, Button, StatusBadge } from '@/components/ui/common';
import { useCattleData } from '@/hooks/useCattleData';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import { Cattle } from '@/types';

export default function CattleList() {
  const { cattle, loading } = useCattleData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [breedFilter, setBreedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [cattleToDelete, setCattleToDelete] = useState<Cattle | null>(null);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!cattleToDelete) return;
    
    const id = cattleToDelete.id;
    if (!id) return;

    setDeletingId(id);
    try {
      await db.cattle.delete(Number(id));
      await db.milkYields.where('cattleId').equals(id).or('cattleId').equals(Number(id)).delete();
      await db.vaccinations.where('cattleId').equals(id).or('cattleId').equals(Number(id)).delete();
      await db.breedingCycles.where('cattleId').equals(id).or('cattleId').equals(Number(id)).delete();
      setCattleToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete cattle locally.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCattle = cattle
    .filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.earTagId.toLowerCase().includes(search.toLowerCase()) ||
        c.breed.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesBreed = breedFilter === 'all' || c.breed === breedFilter;
      
      return matchesSearch && matchesStatus && matchesBreed;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'newest') return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
      if (sortBy === 'oldest') return (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0);
      if (sortBy === 'yield-high') return (b.lastMilkYield || 0) - (a.lastMilkYield || 0);
      if (sortBy === 'yield-low') return (a.lastMilkYield || 0) - (b.lastMilkYield || 0);
      return 0;
    });

  const breeds = Array.from(new Set(cattle.map(c => c.breed))).sort();
  const statuses = ['healthy', 'sick', 'pregnant', 'dry'];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-stone-900">My Cattle</h2>
        <Button onClick={() => navigate('/cattle/new')} size="icon" className="rounded-full shadow-lg h-12 w-12 shrink-0">
          <Plus size={24} />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <Input 
              placeholder="Search ear tag or name..." 
              className="pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            variant={showFilters ? "primary" : "outline"} 
            size="icon" 
            className="rounded-xl shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg h-9 px-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="all">All Statuses</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Breed</label>
              <select 
                value={breedFilter}
                onChange={(e) => setBreedFilter(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg h-9 px-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="all">All Breeds</option>
                {breeds.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg h-9 px-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="newest">Latest Added</option>
                <option value="oldest">Oldest Added</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="yield-high">Highest Yield</option>
                <option value="yield-low">Lowest Yield</option>
              </select>
            </div>
          </Card>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400 animate-pulse">Loading Cattle...</div>
      ) : (
        <div className="grid gap-3">
          {filteredCattle.length > 0 ? (
            filteredCattle.map(c => (
              <Card 
                key={c.id} 
                className="p-3 flex items-center justify-between hover:border-primary/30 cursor-pointer transition-all active:scale-98"
                onClick={() => navigate(`/cattle/${c.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-50 dark:bg-stone-800 dark:border-dark-border">
                    {c.photoUrl ? (
                      <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <MapPin size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-900">{c.name}</h4>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-stone-500 font-medium">#{c.earTagId} • {c.breed}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{c.lastMilkYield ? `Last: ${c.lastMilkYield}L` : 'No milk logs'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCattleToDelete(c);
                    }}
                    className={cn(
                      "p-2 text-stone-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10",
                      deletingId === c.id && "animate-pulse pointer-events-none"
                    )}
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight size={18} className="text-stone-300" />
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-200 dark:bg-dark-card dark:border-dark-border">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3 text-stone-300 dark:bg-stone-800 dark:text-stone-600">
                <Plus size={32} />
              </div>
              <p className="text-stone-400 text-sm">No cattle found</p>
              <Button variant="ghost" onClick={() => setSearch('')} className="mt-2 text-primary">Clear search</Button>
            </div>
          )}
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {cattleToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <Card className="w-full max-w-xs p-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto dark:bg-red-900/20">
              <Trash2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-stone-900">Delete Cattle?</h3>
              <p className="text-sm text-stone-500">
                Are you sure you want to delete <b>{cattleToDelete.name}</b>? This cannot be undone.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                variant="primary" 
                className="bg-red-500 hover:bg-red-600 border-red-500 shadow-lg shadow-red-500/20"
                onClick={handleDelete}
                disabled={!!deletingId}
              >
                {deletingId ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setCattleToDelete(null)}
                disabled={!!deletingId}
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
