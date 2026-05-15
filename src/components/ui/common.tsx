import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Activity, 
  Baby, 
  Tag, 
  Moon,
  AlertCircle
} from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-primary hover:bg-secondary/80 dark:bg-primary/20 dark:text-primary-foreground",
    outline: "border border-stone-200 bg-transparent hover:bg-stone-50 text-stone-700 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-900",
    ghost: "bg-transparent hover:bg-stone-100 text-stone-600 dark:hover:bg-stone-900 dark:text-stone-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-3",
    lg: "px-6 py-4 text-lg",
    icon: "p-2",
  };

  return (
    <button
      className={cn(
        "flex items-center justify-center gap-2 font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-2xl p-4 shadow-sm border border-stone-100 dark:bg-dark-card dark:border-dark-border", className)} {...props}>
      {children}
    </div>
  );
}

export function Input({ className, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="space-y-1.5 flex-1">
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 ml-1 dark:text-stone-400">{label}</label>}
      <input
        className={cn(
          "w-full bg-white border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all dark:bg-dark-card dark:border-dark-border dark:text-stone-100",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function StatusBadge({ status, className }: { status: string, className?: string }) {
  const config: Record<string, { color: string, icon: React.ReactNode, label: string }> = {
    // Cattle Statuses
    healthy: { 
      color: "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30", 
      icon: <CheckCircle2 size={10} />,
      label: "Healthy"
    },
    sick: { 
      color: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30", 
      icon: <Activity size={10} />,
      label: "Sick"
    },
    pregnant: { 
      color: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30", 
      icon: <Baby size={10} />,
      label: "Pregnant"
    },
    sold: { 
      color: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30", 
      icon: <Tag size={10} />,
      label: "Sold"
    },
    deceased: { 
      color: "bg-stone-50 text-stone-600 border-stone-100 dark:bg-stone-800/40 dark:text-stone-400 dark:border-stone-700/30", 
      icon: <Moon size={10} />,
      label: "Deceased"
    },
    // Vaccination & General Statuses
    completed: { 
      color: "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30", 
      icon: <CheckCircle2 size={10} />,
      label: "Completed"
    },
    pending: { 
      color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30", 
      icon: <Activity size={10} />,
      label: "Pending"
    },
    overdue: { 
      color: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30", 
      icon: <AlertCircle size={10} />,
      label: "Overdue"
    },
    // Breeding Statuses
    heat: { 
      color: "bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800/30", 
      icon: <Activity size={10} />,
      label: "In Heat"
    },
    bred: { 
      color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30", 
      icon: <CheckCircle2 size={10} />,
      label: "Bred"
    },
    "heat-missed": { 
      color: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30", 
      icon: <Moon size={10} />,
      label: "Heat Missed"
    }
  };

  const current = config[status.toLowerCase()] || { 
    color: "bg-stone-50 text-stone-500 border-stone-100 dark:bg-stone-800/40 dark:text-stone-400 dark:border-stone-700/30", 
    icon: <AlertCircle size={10} />,
    label: status 
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider h-5 transition-colors",
      current.color,
      className
    )}>
      {current.icon}
      {current.label}
    </div>
  );
}
