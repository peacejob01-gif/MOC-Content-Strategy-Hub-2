import React from 'react';
import { Milestone, MonthPlan } from '../types';
import { Target, Calendar, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  milestones: Milestone[];
  roadmap: MonthPlan[];
  completedCount: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ milestones, roadmap, completedCount }) => {
  
  const getProgressColor = (current: number, target: number) => {
    const pct = (current / target) * 100;
    if (pct >= 100) return 'bg-green-500';
    if (pct >= 50) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  const chartData = milestones.map(m => ({
    name: m.name,
    Progress: m.currentValue,
    Target: m.targetKPI
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <Target className="w-8 h-8 text-blue-900" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Strategic Planning Dashboard</h2>
          <p className="text-slate-500 text-sm">Project Cycle: 240 Days Strategy</p>
        </div>
      </div>

      {/* KPI & Milestones Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Milestone Tracker
            </h3>
            <div className="grid grid-cols-1 gap-4">
                {milestones.map((ms) => {
                    const percentage = Math.min(100, Math.round((ms.currentValue / ms.targetKPI) * 100));
                    return (
                        <div key={ms.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h4 className="font-bold text-blue-900">{ms.name}</h4>
                                    <p className="text-xs text-slate-500">{ms.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-800">{ms.currentValue}</span>
                                    <span className="text-sm text-slate-400"> / {ms.targetKPI}</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3">
                                <div 
                                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(ms.currentValue, ms.targetKPI)}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <div className="mt-1 text-xs text-right text-slate-500">{percentage}% Completed</div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Chart Visualization */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-semibold text-slate-700 mb-4">Performance Overview</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} style={{fontSize: '12px'}} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="Progress" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="Target" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-blue-900">Total Published Content</p>
                    <p className="text-2xl font-bold text-blue-700">{completedCount} Pieces</p>
                </div>
             </div>
        </div>
      </div>

      {/* Monthly Roadmap */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Roadmap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmap.map((plan, index) => (
                <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-blue-900 text-white p-3 text-center font-semibold">
                        {plan.month}
                    </div>
                    <div className="p-4">
                        <div className="mb-3">
                            <span className="text-xs uppercase font-bold text-slate-400">Theme</span>
                            <p className="text-blue-700 font-medium">{plan.theme}</p>
                        </div>
                        <div>
                            <span className="text-xs uppercase font-bold text-slate-400">Highlights</span>
                            <ul className="mt-1 space-y-1">
                                {plan.highlights.map((hl, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 mr-2 flex-shrink-0"></span>
                                        {hl}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Remarks Section */}
      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2 text-slate-700">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-sm">Phase Duration Remarks</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-600">
            <div className="p-2 bg-white rounded border border-slate-200 shadow-sm">
                <span className="font-bold text-blue-900">Phase 1:</span> 30 Jan 2026 - 9 Apr 2026 (Target: 200)
            </div>
            <div className="p-2 bg-white rounded border border-slate-200 shadow-sm">
                <span className="font-bold text-blue-900">Phase 2:</span> 10 Apr 2026 - 6 Jul 2026 (Target: 200)
            </div>
            <div className="p-2 bg-white rounded border border-slate-200 shadow-sm">
                <span className="font-bold text-blue-900">Phase 3:</span> 7 Jul 2026 - 6 Sep 2026 (Target: 200)
            </div>
        </div>
      </div>
    </div>
  );
};
