import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Heart, ArrowRight, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/common';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      alert("Please enter both Name and Email");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, name);
      navigate('/dashboard');
    } catch (error) {
      console.error("Local setup failed:", error);
      alert("Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col max-w-md mx-auto border-x border-stone-100 dark:bg-dark-bg dark:border-dark-border">
      <div className="flex-1 p-8 flex flex-col justify-center gap-8">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-display font-black text-primary leading-none tracking-tight">GoSeva<br/><span className="text-stone-900 dark:text-white">Tracker</span></h1>
          <p className="text-stone-500 font-medium">The local-first health passport for your cattle.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-white p-6 rounded-3xl border border-stone-100 shadow-sm dark:bg-dark-card dark:border-dark-border">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Parikshith"
                className="w-full h-12 bg-stone-50 rounded-xl border border-stone-100 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-dark-bg dark:border-dark-border dark:text-white"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 font-bold">@</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 bg-stone-50 rounded-xl border border-stone-100 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:bg-dark-bg dark:border-dark-border dark:text-white"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-md rounded-2xl bg-primary hover:bg-primary/90 mt-4" disabled={loading}>
            {loading ? 'Setting up...' : (
              <>
                Get Started Locally
                <ArrowRight size={20} />
              </>
            )}
          </Button>
        </form>

        <div className="space-y-4 opacity-60">
          <FeatureItem icon={<TrendingUp size={20} />} label="Track Milk Production" description="Monitor daily yields locally." />
          <FeatureItem icon={<ShieldCheck size={20} />} label="Health Records" description="Stored securely on your device." />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, label, description }: { icon: React.ReactNode; label: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-stone-100 flex items-center justify-center shrink-0 text-primary dark:bg-dark-card dark:border-dark-border">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-stone-900 text-sm leading-none dark:text-white">{label}</h4>
        <p className="text-xs text-stone-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
