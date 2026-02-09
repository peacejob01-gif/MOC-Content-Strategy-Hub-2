import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar as CalendarIcon, Archive as ArchiveIcon } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { DailyOps } from './components/DailyOps';
import { Archive } from './components/Archive';
import { NewsItem, Milestone, MonthPlan, Category, Status, ContentType, CONTENT_TYPES } from './types';

// Mock Data for Roadmap
const MOCK_ROADMAP: MonthPlan[] = [
  { month: 'April', theme: 'Songkran & Soft Power', highlights: ['Elephant Pants Viral', 'Water Festival Safety'] },
  { month: 'May', theme: 'Back to School', highlights: ['School Uniform Pricing', 'Stationery Support'] },
  { month: 'June', theme: 'Fruit Season', highlights: ['Durian Export', 'Mangosteen Festival'] },
  { month: 'July', theme: 'King\'s Birthday', highlights: ['Royal Projects', 'Community Service'] },
];

const MOCK_MILESTONES: Milestone[] = [
  { id: '1', name: 'Phase 1 Delivery', deadlineDay: 70, targetKPI: 200, currentValue: 0, description: '30 Jan - 9 Apr 2026' },
  { id: '2', name: 'Phase 2 Delivery', deadlineDay: 158, targetKPI: 200, currentValue: 0, description: '10 Apr - 6 Jul 2026' },
  { id: '3', name: 'Phase 3 Delivery', deadlineDay: 220, targetKPI: 200, currentValue: 0, description: '7 Jul - 6 Sep 2026' },
];

// Phase Dates Configuration
const PHASE_RANGES = [
    { id: '1', start: '2026-01-30', end: '2026-04-09' },
    { id: '2', start: '2026-04-10', end: '2026-07-06' },
    { id: '3', start: '2026-07-07', end: '2026-09-06' }
];

// Generate mock data centered around 2026 to visualize the phases
const generateMockNews = (): NewsItem[] => {
  const items: NewsItem[] = [];
  const categories: Category[] = ['Trust & Impact', 'MOC Update', 'Policy to People'];
  const statuses: Status[] = ['Published', 'Reviewing', 'In Production', 'Backlog'];
  
  // Start generating from Phase 1 start in 2026
  const baseDate = new Date('2026-02-01');
  
  // Create 60 mock items
  for (let i = 0; i < 60; i++) {
    const isPublished = i < 40; // First 40 are published
    const date = new Date(baseDate);
    // Spread dates over ~150 days to cover Phase 1 and part of Phase 2
    date.setDate(date.getDate() + Math.floor(Math.random() * 150)); 
    
    items.push({
      id: `mock-${i}`,
      originalText: `Mock news content ${i}`,
      summary: `Strategic Content Update regarding MOC Policy ${i+1}`,
      contentType: CONTENT_TYPES[Math.floor(Math.random() * CONTENT_TYPES.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      status: isPublished ? 'Published' : statuses[Math.floor(Math.random() * 3) + 1],
      isHighlight: Math.random() > 0.8,
      timestamp: date.toLocaleString(),
      date: date.toISOString().split('T')[0],
    });
  }
  return items;
};

const CURRENT_MONTH_THEME = "Back to School";
const CURRENT_PROJECT_DAY = 100;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily' | 'archive'>('dashboard');
  const [newsItems, setNewsItems] = useState<NewsItem[]>(generateMockNews());
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  
  // Update Milestones based on REAL count from Content Library (Published items)
  // Logic: Check if item date falls within the specific Phase Date Ranges
  useEffect(() => {
    setMilestones(prev => prev.map((m) => {
        // Find configuration for this phase
        const range = PHASE_RANGES.find(r => r.id === m.id);
        
        if (!range) return m;

        const startTimestamp = new Date(range.start).getTime();
        const endTimestamp = new Date(range.end).getTime();
        
        const count = newsItems.filter(item => {
            if (item.status !== 'Published') return false;
            
            const itemTimestamp = new Date(item.date).getTime();
            return itemTimestamp >= startTimestamp && itemTimestamp <= endTimestamp;
        }).length;

        return {
            ...m,
            currentValue: count
        };
    }));
  }, [newsItems]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
            milestones={milestones} 
            roadmap={MOCK_ROADMAP} 
            completedCount={newsItems.filter(i => i.status === 'Published').length} 
        />;
      case 'daily':
        return <DailyOps 
            newsItems={newsItems} 
            setNewsItems={setNewsItems} 
            currentMonthTheme={CURRENT_MONTH_THEME}
        />;
      case 'archive':
        return <Archive newsItems={newsItems} setNewsItems={setNewsItems} />;
      default:
        return <Dashboard milestones={milestones} roadmap={MOCK_ROADMAP} completedCount={0} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col fixed h-full shadow-2xl z-20">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold leading-tight">MOC<br/><span className="text-blue-300 font-light text-base">Content Hub</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-700 text-white shadow-md' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Strategic Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('daily')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'daily' ? 'bg-blue-700 text-white shadow-md' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="font-medium">Calendar & Ops</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('archive')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'archive' ? 'bg-blue-700 text-white shadow-md' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}
          >
            <ArchiveIcon className="w-5 h-5" />
            <span className="font-medium">Content Library</span>
          </button>
        </nav>

        <div className="p-4 bg-blue-950 text-xs text-blue-400">
            <p>Theme: {CURRENT_MONTH_THEME}</p>
            <p className="mt-1">Day {CURRENT_PROJECT_DAY}/240</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;