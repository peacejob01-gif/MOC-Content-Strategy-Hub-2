import React, { useState } from 'react';
import { NewsItem, Status, Category, ContentType, STATUSES, CONTENT_TYPES } from '../types';
import { analyzeNewsContent } from '../services/geminiService';
import { 
    Send, Sparkles, Loader2, Plus, ChevronLeft, ChevronRight, 
    X, Calendar as CalendarIcon, CheckCircle2, Trash2, AlertTriangle,
    LayoutGrid, CalendarRange, List, Video, Image as ImageIcon, Newspaper, Camera
} from 'lucide-react';

interface DailyOpsProps {
  newsItems: NewsItem[];
  setNewsItems: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  currentMonthTheme: string;
}

type ViewMode = 'month' | 'week' | 'day';

export const DailyOps: React.FC<DailyOpsProps> = ({ newsItems, setNewsItems, currentMonthTheme }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Creation/Edit Form State
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState<{
    summary: string;
    category: Category;
    contentType: ContentType;
    status: Status;
  }>({
    summary: '',
    category: 'MOC Update',
    contentType: 'PR Press',
    status: 'Backlog'
  });

  // --- Date Helpers ---

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return newsItems.filter(item => item.date === dateStr);
  };

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
        newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 is Sunday
    const diff = d.getDate() - day; 
    d.setDate(diff);
    return d;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const formatDateTitle = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    
    if (viewMode === 'month') {
        return currentDate.toLocaleDateString('en-US', options);
    } else if (viewMode === 'week') {
        const start = getStartOfWeek(currentDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startStr} - ${endStr}`;
    } else {
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  // --- AI & Form Logic ---

  const handleAnalysis = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    const analysis = await analyzeNewsContent(inputText, currentMonthTheme);
    
    setFormData({
      ...formData,
      summary: analysis.summary,
      contentType: analysis.contentType,
      category: analysis.category,
    });
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    if (!formData.summary) return;

    if (editingId) {
      // Update existing item
      setNewsItems(prev => prev.map(item => 
        item.id === editingId 
        ? {
            ...item,
            originalText: inputText, // Update original text if changed in analysis box
            summary: formData.summary,
            contentType: formData.contentType,
            category: formData.category,
            status: formData.status,
            date: selectedDate
          } 
        : item
      ));
    } else {
      // Create new item
      const newItem: NewsItem = {
        id: Date.now().toString(),
        originalText: inputText || formData.summary,
        summary: formData.summary,
        contentType: formData.contentType,
        category: formData.category,
        status: formData.status,
        isHighlight: false,
        timestamp: new Date().toLocaleString(),
        date: selectedDate
      };
      setNewsItems(prev => [...prev, newItem]);
    }
    closeModal();
  };

  const initiateDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!editingId) return;
    setNewsItems(prev => prev.filter(item => item.id !== editingId));
    setShowDeleteConfirm(false);
    closeModal();
  };

  const openCreateModal = (dateStr?: string) => {
    if (dateStr) setSelectedDate(dateStr);
    else setSelectedDate(currentDate.toISOString().split('T')[0]);
    
    setEditingId(null);
    setFormData({
        summary: '',
        category: 'MOC Update',
        contentType: 'PR Press',
        status: 'Backlog'
    });
    setInputText('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: NewsItem) => {
    setEditingId(item.id);
    setSelectedDate(item.date);
    setInputText(item.originalText);
    setFormData({
        summary: item.summary,
        category: item.category,
        contentType: item.contentType,
        status: item.status
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowDeleteConfirm(false);
    setEditingId(null);
  };

  const getCategoryColor = (c: Category) => {
    switch (c) {
      case 'Trust & Impact': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'MOC Update': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Policy to People': return 'bg-teal-100 text-teal-700 border-teal-200';
    }
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
        case 'Video': return <Video className="w-3 h-3" />;
        case 'Banner': return <ImageIcon className="w-3 h-3" />;
        case 'Photo Album': return <Camera className="w-3 h-3" />;
        case 'PR Press': return <Newspaper className="w-3 h-3" />;
    }
  };

  // --- Render Views ---

  const renderMonthView = () => {
    const { days, firstDay } = getDaysInMonth(currentDate);
    const daysArray = Array.from({ length: days }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-7 border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase border-r border-slate-200 last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
                {blanksArray.map((_, i) => (
                    <div key={`blank-${i}`} className="p-2 border-b border-r border-slate-100 bg-slate-50/50 min-h-[120px]"></div>
                ))}
                
                {daysArray.map(day => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const events = getEventsForDate(date);
                    const dateStr = date.toISOString().split('T')[0];
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    return (
                        <div 
                            key={day} 
                            className={`p-2 border-b border-r border-slate-100 min-h-[120px] transition-colors hover:bg-slate-50 group cursor-pointer ${isToday ? 'bg-blue-50/30' : ''}`}
                            onClick={() => openCreateModal(dateStr)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700 group-hover:bg-slate-200'}`}>
                                    {day}
                                </span>
                                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-1">
                                {events.map(event => (
                                    <div 
                                        key={event.id} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(event);
                                        }}
                                        className={`text-xs p-1.5 rounded border mb-1 truncate cursor-pointer hover:opacity-80 transition-opacity ${getCategoryColor(event.category)} ${event.status === 'Published' ? 'opacity-60' : ''}`}
                                    >
                                        <div className="flex items-center space-x-1">
                                            {event.status === 'Published' && <CheckCircle2 className="w-3 h-3 flex-shrink-0" />}
                                            <span className="truncate font-medium">{event.summary}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    return (
        <div className="flex-1 overflow-y-auto">
             <div className="grid grid-cols-7 border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                    const date = weekDays[idx];
                    const isToday = new Date().toISOString().split('T')[0] === date.toISOString().split('T')[0];
                    return (
                        <div key={day} className={`py-3 text-center border-r border-slate-200 last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}>
                            <div className="text-xs font-semibold text-slate-500 uppercase">{day}</div>
                            <div className={`text-lg font-bold mt-1 ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                                {date.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="grid grid-cols-7 h-full min-h-[500px]">
                {weekDays.map((date, idx) => {
                    const events = getEventsForDate(date);
                    const dateStr = date.toISOString().split('T')[0];

                    return (
                        <div 
                            key={idx} 
                            className="p-2 border-r border-slate-100 last:border-r-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                            onClick={() => openCreateModal(dateStr)}
                        >
                            <div className="h-full space-y-2">
                                {events.map(event => (
                                    <div 
                                        key={event.id} 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(event);
                                        }}
                                        className={`text-xs p-2 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-all ${getCategoryColor(event.category)} ${event.status === 'Published' ? 'opacity-70' : ''}`}
                                    >
                                        <div className="font-semibold mb-1 line-clamp-2">{event.summary}</div>
                                        <div className="flex items-center justify-between text-[10px] opacity-80">
                                            <span>{event.category.split(' ')[0]}</span>
                                            {event.status === 'Published' && <CheckCircle2 className="w-3 h-3" />}
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:border-blue-300 hover:text-blue-500 transition-all text-xs font-medium flex justify-center items-center">
                                    <Plus className="w-3 h-3 mr-1" /> Add
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderDayView = () => {
    const events = getEventsForDate(currentDate);
    
    // Group events by status for a mini Kanban view on Day mode
    const groupedEvents = STATUSES.reduce((acc, status) => {
        acc[status] = events.filter(e => e.status === status);
        return acc;
    }, {} as Record<Status, NewsItem[]>);

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            <div className="grid grid-cols-4 gap-6 h-full min-h-[500px]">
                {STATUSES.map(status => (
                    <div key={status} className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">{status}</h3>
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                {groupedEvents[status].length}
                            </span>
                        </div>
                        <div className="bg-slate-100/50 rounded-xl p-2 flex-1 border border-slate-200/60">
                            {groupedEvents[status].length === 0 ? (
                                <div className="h-24 flex items-center justify-center text-slate-400 text-xs italic">
                                    No items
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {groupedEvents[status].map(event => (
                                        <div 
                                            key={event.id}
                                            onClick={() => openEditModal(event)}
                                            className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                                    event.category === 'MOC Update' ? 'bg-blue-100 text-blue-700' :
                                                    event.category === 'Trust & Impact' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-teal-100 text-teal-700'
                                                }`}>
                                                    {event.category}
                                                </span>
                                                <div className="flex items-center space-x-1 text-slate-500" title={event.contentType}>
                                                    {getContentTypeIcon(event.contentType)}
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-slate-800 line-clamp-3 mb-2">
                                                {event.summary}
                                            </p>
                                            <div className="text-[10px] text-slate-400 flex justify-between items-center">
                                                <span>{event.timestamp.split(',')[1]}</span>
                                                {event.isHighlight && <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {status === 'Backlog' && (
                                <button 
                                    onClick={() => openCreateModal(currentDate.toISOString().split('T')[0])}
                                    className="w-full mt-3 py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-colors text-xs font-medium flex items-center justify-center"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Task
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center space-x-6">
            <h2 className="text-xl font-bold text-slate-800 w-64">
                {formatDateTitle()}
            </h2>
            
            <div className="flex items-center bg-slate-100 rounded-lg p-1 space-x-1">
                <button 
                    onClick={() => setViewMode('month')}
                    className={`p-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-1 ${viewMode === 'month' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden md:inline">Month</span>
                </button>
                <button 
                    onClick={() => setViewMode('week')}
                    className={`p-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-1 ${viewMode === 'week' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                    <CalendarRange className="w-4 h-4" />
                    <span className="hidden md:inline">Week</span>
                </button>
                <button 
                    onClick={() => setViewMode('day')}
                    className={`p-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-1 ${viewMode === 'day' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                    <List className="w-4 h-4" />
                    <span className="hidden md:inline">Daily</span>
                </button>
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                <button onClick={() => navigateDate(-1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft className="w-4 h-4 text-slate-600"/></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white rounded shadow-sm transition-all">Today</button>
                <button onClick={() => navigateDate(1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronRight className="w-4 h-4 text-slate-600"/></button>
            </div>
        </div>
        <button 
            onClick={() => openCreateModal()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Create Content</span>
        </button>
      </div>

      {/* Render Active View */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                        {editingId ? 'Edit Content Activity' : 'New Content Activity'}
                    </h3>
                    <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Left Side: AI Assistant */}
                    <div className="md:w-1/2 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-r border-slate-100 flex flex-col shrink-0 overflow-y-auto">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                            AI News Analysis
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">Paste raw news content here. Gemini will summarize and categorize it for you.</p>
                        
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-1 w-full min-h-[150px] bg-white border border-blue-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none mb-4"
                            placeholder="Paste news content from Line..."
                        />
                        
                        <button
                            onClick={handleAnalysis}
                            disabled={isAnalyzing || !inputText.trim()}
                            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Generate Details
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Side: Form Details */}
                    <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col">
                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                                <input 
                                    type="date" 
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content Summary</label>
                                <textarea 
                                    value={formData.summary}
                                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                    placeholder="Enter summary..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="Trust & Impact">Trust & Impact</option>
                                        <option value="MOC Update">MOC Update</option>
                                        <option value="Policy to People">Policy to People</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contents</label>
                                    <select 
                                        value={formData.contentType}
                                        onChange={(e) => setFormData({...formData, contentType: e.target.value as ContentType})}
                                        className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        {CONTENT_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value as Status})}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    {STATUSES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center shrink-0">
                            {editingId ? (
                                <button 
                                    onClick={initiateDelete}
                                    className="flex items-center space-x-1 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                                    title="Delete this activity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            ) : (
                                <div></div> /* Spacer */
                            )}

                            <div className="flex space-x-3">
                                <button 
                                    onClick={closeModal}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={!formData.summary}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {editingId ? 'Update Activity' : 'Save Activity'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fade-in border border-slate-100">
                <div className="flex items-center space-x-3 mb-4 text-red-600">
                    <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
                </div>
                
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Are you sure you want to delete this activity? This action cannot be undone and will remove the item from all reports.
                </p>
                
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Delete Permanently
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};