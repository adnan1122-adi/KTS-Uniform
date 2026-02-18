
import React, { useState, useEffect } from 'react';
import { fetchAdminRequests, approveRequest, getMessage, updateMessage, fetchSummary, allowEdit } from '../services/api';
import { AdminRequestRow, AdminTab, AppMessage, SizeSummary } from '../types';
import { 
  Lock, Search, Loader2, AlertCircle, RefreshCw, LogOut, MessageSquare, 
  LayoutList, Save, CheckCircle, BarChart3, ToggleLeft, ToggleRight, UserCog
} from 'lucide-react';
import { PRIMARY_BLUE, UNIFORM_SIZES } from '../constants';

const AdminPortal: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.REQUESTS);
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<AdminRequestRow[]>([]);
  const [summary, setSummary] = useState<SizeSummary | null>(null);
  const [schoolMessage, setSchoolMessage] = useState<AppMessage>({ english: '', arabic: '', modification: 'enabled' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminRequests(password);
      setRequests(data);
      const msg = await getMessage();
      setSchoolMessage(msg);
      setIsLoggedIn(true);
    } catch (err: any) { 
      setError(err.message || 'Login failed.'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleApprove = async (row: number) => {
    setActionId(row);
    try {
      if (await approveRequest(row, password)) {
        setRequests(prev => prev.filter(r => r.row !== row));
      }
    } finally { 
      setActionId(null); 
    }
  };

  const handleAllowEdit = async (row: number) => {
    setActionId(row);
    try {
      if (await allowEdit(row, password)) {
        setRequests(prev => prev.filter(r => r.row !== row));
      }
    } finally { 
      setActionId(null); 
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === AdminTab.SUMMARY) {
      setIsLoading(true);
      fetchSummary(password)
        .then(setSummary)
        .catch(() => setError("Failed to fetch summary"))
        .finally(() => setIsLoading(false));
    }
  }, [activeTab, isLoggedIn, password]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Staff Portal</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Admin Password" 
              className="w-full p-4 bg-gray-50 border rounded-xl outline-none text-center focus:ring-2 focus:ring-blue-500 transition-all" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button 
              type="submit" 
              disabled={isLoading} 
              style={{ backgroundColor: PRIMARY_BLUE }} 
              className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <button 
          onClick={() => setIsLoggedIn(false)} 
          className="p-2 text-red-600 font-bold flex items-center gap-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>

      <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
        <button onClick={() => setActiveTab(AdminTab.REQUESTS)} className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === AdminTab.REQUESTS ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Requests</button>
        <button onClick={() => setActiveTab(AdminTab.SUMMARY)} className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === AdminTab.SUMMARY ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Inventory</button>
        <button onClick={() => setActiveTab(AdminTab.MESSAGE)} className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === AdminTab.MESSAGE ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Settings</button>
      </div>

      {activeTab === AdminTab.REQUESTS && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Action Type</th>
                  <th className="px-6 py-4">Requested Sizes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center text-gray-400 italic">No actions pending at this time.</td></tr>
                ) : requests.map(req => (
                  <tr key={req.row} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{req.englishName}</div>
                      <div className="text-xs text-gray-400">{req.studentId} • {req.grade}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${req.requestStatus === 'ModificationRequested' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {req.requestStatus === 'ModificationRequested' ? 'EDIT REQUEST' : 'NEW SUBMISSION'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">
                      S:{req.shirt} T:{req.trousers} J:{req.jacket}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.requestStatus === 'ModificationRequested' ? (
                        <button onClick={() => handleAllowEdit(req.row)} disabled={actionId === req.row} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                          {actionId === req.row ? <Loader2 className="h-3 w-3 animate-spin" /> : "Allow Edit"}
                        </button>
                      ) : (
                        <button onClick={() => handleApprove(req.row)} disabled={actionId === req.row} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                          {actionId === req.row ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === AdminTab.SUMMARY && summary && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-soft">
           <h3 className="text-xl font-bold mb-6">Inventory Overview</h3>
           <table className="w-full text-center">
             <thead>
               <tr className="bg-gray-50 text-xs text-gray-500 uppercase"><th className="px-4 py-3 text-left">Item</th>{UNIFORM_SIZES.map(s => <th key={s}>{s}</th>)}<th className="bg-blue-50">Total</th></tr>
             </thead>
             <tbody className="font-bold divide-y">
               {['shirt', 'trousers', 'jacket'].map(type => (
                 <tr key={type}>
                   <td className="px-4 py-4 text-left capitalize">{type}</td>
                   {UNIFORM_SIZES.map(s => <td key={s} className="text-gray-600">{summary[type as keyof SizeSummary][s] || 0}</td>)}
                   <td className="bg-blue-50 text-blue-700">{Object.values(summary[type as keyof SizeSummary]).reduce((a: any, b: any) => a + b, 0)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {activeTab === AdminTab.MESSAGE && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 shadow-soft">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-xl font-bold">System Settings</h3>
            <button 
              onClick={() => setSchoolMessage(p => ({ ...p, modification: p.modification === 'enabled' ? 'disabled' : 'enabled' }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border ${schoolMessage.modification === 'enabled' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}
            >
              {schoolMessage.modification === 'enabled' ? <ToggleRight /> : <ToggleLeft />}
              Staff Approval for Changes: {schoolMessage.modification === 'enabled' ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <textarea value={schoolMessage.english} onChange={e => setSchoolMessage(p => ({ ...p, english: e.target.value }))} className="p-4 bg-gray-50 border rounded-2xl h-32" placeholder="English Announcement" />
            <textarea dir="rtl" value={schoolMessage.arabic} onChange={e => setSchoolMessage(p => ({ ...p, arabic: e.target.value }))} className="p-4 bg-gray-50 border rounded-2xl h-32 font-arabic text-lg" placeholder="Arabic Announcement" />
          </div>
          <button 
            disabled={isLoading}
            onClick={async () => { 
              setIsLoading(true); 
              if (await updateMessage(schoolMessage, password)) {
                setSuccess('Saved!');
                setTimeout(() => setSuccess(null), 3000);
              }
              setIsLoading(false); 
            }} 
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl"
          >
            {isLoading ? <Loader2 className="h-5 w-5 mx-auto animate-spin" /> : "Save Settings"}
          </button>
          {success && <p className="text-green-600 text-center font-bold">{success}</p>}
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
