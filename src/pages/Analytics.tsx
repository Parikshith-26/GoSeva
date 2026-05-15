import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { TrendingUp, Milk, ChevronDown, Download } from 'lucide-react';
import { Card, Button } from '@/components/ui/common';
import { useCattleData } from '@/hooks/useCattleData';
import { formatDate } from '@/lib/utils';

export default function Analytics() {
  const { recentYields, loading } = useCattleData();

  const chartData = useMemo(() => {
    // Group by date and sum total
    const grouped = recentYields.reduce((acc: any, y) => {
      const date = y.date;
      if (!acc[date]) acc[date] = 0;
      acc[date] += y.total;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, total]) => ({
        date: formatDate(date).split(',')[0], // Just Day/Month
        total: total as number,
        originalDate: date
      }))
      .sort((a, b) => a.originalDate.localeCompare(b.originalDate));
  }, [recentYields]);

  const averageYield = chartData.length > 0 
    ? chartData.reduce((acc, d) => acc + d.total, 0) / chartData.length 
    : 0;

  const distribution = useMemo(() => {
    const totalMorning = recentYields.reduce((acc, y) => acc + y.morning, 0);
    const totalEvening = recentYields.reduce((acc, y) => acc + y.evening, 0);
    const grandTotal = totalMorning + totalEvening;

    if (grandTotal === 0) return { morning: 50, evening: 50 };

    return {
      morning: Math.round((totalMorning / grandTotal) * 100),
      evening: Math.round((totalEvening / grandTotal) * 100)
    };
  }, [recentYields]);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-stone-900 leading-tight">Milk Analytics</h2>
        <Button variant="outline" size="sm" className="rounded-xl border-stone-200">
          <Download size={16} />
          Export
        </Button>
      </div>

      {/* Summary Stat */}
      <Card className="bg-primary text-white border-none p-6 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Monthly Average</p>
          <p className="text-5xl font-display font-black leading-none">{averageYield.toFixed(1)} <span className="text-xl font-medium">L/day</span></p>
          <div className="flex items-center gap-2 mt-4 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            <TrendingUp size={14} className="text-green-300" />
            <span className="text-[10px] font-bold">+12% from last month</span>
          </div>
        </div>
        <Milk size={80} className="absolute -right-4 -bottom-4 text-white/10 rotate-12" />
      </Card>

      {/* Main Chart */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-stone-50 dark:border-dark-border">
          <h4 className="font-bold text-stone-900 text-sm">Yield Trends (Last 10 Entries)</h4>
          <div className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase">
            Entries <ChevronDown size={14} />
          </div>
        </div>
        <div className="h-64 w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#A8A29E' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#A8A29E' }} 
                width={30}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                itemStyle={{ color: '#2E7D32', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#2E7D32" 
                strokeWidth={3} 
                dot={{ fill: '#2E7D32', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Distribution */}
      <section className="space-y-3">
        <h4 className="font-display font-bold text-stone-900">Yield Distribution</h4>
        <div className="grid grid-cols-1 gap-3">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
              <Milk size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-stone-700">Morning Shift</span>
                <span className="text-xs font-black text-primary">{distribution.morning}%</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden dark:bg-stone-800">
                <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${distribution.morning}%` }}></div>
              </div>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
              <Milk size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-stone-700">Evening Shift</span>
                <span className="text-xs font-black text-accent">{distribution.evening}%</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden dark:bg-stone-800">
                <div className="bg-accent h-full rounded-full transition-all duration-1000" style={{ width: `${distribution.evening}%` }}></div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* AI Recommendations */}
      <Card className="bg-stone-900 text-white border-none p-6 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Gemini Prediction</span>
          </div>
          <p className="text-lg font-display font-medium leading-snug">
            Based on current trends, yield is expected to peak between May 15-20. Ensure adequate green fodder.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-wider border-t border-white/10 pt-4">
            <span>Accuracy: 88%</span>
            <span>Refreshed 2h ago</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
