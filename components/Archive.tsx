import React, { useState } from 'react';
import { NewsItem, Status, STATUSES } from '../types';
import { Download, FileText, ExternalLink, Image as ImageIcon, Trash2, AlertTriangle, Filter } from 'lucide-react';

interface ArchiveProps {
  newsItems: NewsItem[];
  setNewsItems: React.Dispatch<React.SetStateAction<NewsItem[]>>;
}

export const Archive: React.FC<ArchiveProps> = ({ newsItems, setNewsItems }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');

  // Sort by date descending (newest first)
  const sortedItems = [...newsItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter based on selection
  const displayedItems = statusFilter === 'All' 
    ? sortedItems 
    : sortedItems.filter(item => item.status === statusFilter);

  const handleExport = () => {
    // Export what is currently displayed
    const headers = ['ID', 'Scheduled Date', 'Summary', 'Category', 'Content Type', 'Status', 'Is Highlight', 'Original Text', 'Creation Timestamp'];
    const rows = displayedItems.map(item => [
      item.id,
      `"${item.date}"`,
      `"${item.summary.replace(/"/g, '""')}"`,
      item.category,
      item.contentType,
      item.status,
      item.isHighlight ? 'Yes' : 'No',
      `"${item.originalText.replace(/"/g, '""')}"`,
      `"${item.timestamp}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `moc_content_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedItems.length && displayedItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedItems.map(item => item.id));
    }
  };

  const initiateSingleDelete = (id: string) => {
    setDeleteId(id);
    setIsBulkDelete(false);
    setShowConfirmModal(true);
  };

  const initiateBulkDelete = () => {
    setIsBulkDelete(true);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (isBulkDelete) {
      setNewsItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    } else if (deleteId) {
      setNewsItems(prev => prev.filter(item => item.id !== deleteId));
      setDeleteId(null);
    }
    setShowConfirmModal(false);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setDeleteId(null);
    setIsBulkDelete(false);
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
        case 'Published': return 'text-green-600 bg-green-50 border-green-200';
        case 'Reviewing': return 'text-amber-600 bg-amber-50 border-amber-200';
        case 'In Production': return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'Backlog': return 'text-slate-600 bg-slate-100 border-slate-200';
        default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-900" />
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Content Library & Report</h2>
                <p className="text-slate-500 text-sm">Manage all content items (Syncs with Calendar)</p>
            </div>
        </div>
        <div className="flex space-x-3">
            {selectedIds.length > 0 && (
                <button
                    onClick={initiateBulkDelete}
                    className="flex items-center space-x-2 bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors shadow-sm animate-fade-in"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Selected ({selectedIds.length})</span>
                </button>
            )}
            <button
                onClick={handleExport}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-600">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter by Status:</span>
            </div>
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
            >
                <option value="All">All Items</option>
                {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
            <div className="text-xs text-slate-400 ml-auto">
                Showing {displayedItems.length} items
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                        <th className="p-4 w-10">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={displayedItems.length > 0 && selectedIds.length === displayedItems.length}
                                onChange={toggleSelectAll}
                            />
                        </th>
                        <th className="p-4 font-semibold">Scheduled Date</th>
                        <th className="p-4 font-semibold">Content Summary</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold text-center">Content Type</th>
                        <th className="p-4 font-semibold text-center">Status</th>
                        <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {displayedItems.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400">
                                No content found matching your filter.
                            </td>
                        </tr>
                    ) : (
                        displayedItems.map((item) => (
                            <tr key={item.id} className={`border-b border-slate-100 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                <td className="p-4">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => toggleSelection(item.id)}
                                    />
                                </td>
                                <td className="p-4 text-slate-500 whitespace-nowrap font-mono">{item.date}</td>
                                <td className="p-4 text-slate-800 font-medium max-w-md truncate">
                                    {item.isHighlight && (
                                        <span className="inline-block w-2 h-2 bg-amber-400 rounded-full mr-2" title="Highlight"></span>
                                    )}
                                    {item.summary}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium 
                                        ${item.category === 'MOC Update' ? 'bg-blue-100 text-blue-700' : 
                                          item.category === 'Trust & Impact' ? 'bg-purple-100 text-purple-700' : 
                                          'bg-teal-100 text-teal-700'}`}>
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                                        {item.contentType}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center space-x-2">
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50" title="View Details">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => initiateSingleDelete(item.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fade-in border border-slate-100">
                <div className="flex items-center space-x-3 mb-4 text-red-600">
                    <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                        {isBulkDelete ? `Delete ${selectedIds.length} Items?` : 'Confirm Deletion'}
                    </h3>
                </div>
                
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    {isBulkDelete 
                        ? `Are you sure you want to delete these ${selectedIds.length} items? This will remove them from the Calendar and Reports.` 
                        : 'Are you sure you want to delete this content? This will remove it from the Calendar and Reports.'}
                </p>
                
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={cancelDelete}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};