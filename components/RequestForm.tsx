
import React, { useState } from 'react';
import { StudentInfo, UniformRequest, UniformSize, AppMessage } from '../types';
import { UNIFORM_SIZES, PRIMARY_BLUE } from '../constants';
import { User, ClipboardList, CheckCircle2, AlertCircle, Loader2, Edit3, Hourglass, RefreshCw, LogOut } from 'lucide-react';
import { requestModification, searchStudent } from '../services/api';

interface RequestFormProps {
  student: StudentInfo;
  onSubmit: (request: UniformRequest) => Promise<void>;
  isSubmitting: boolean;
  status: 'idle' | 'success' | 'duplicate' | 'error';
  config: AppMessage;
  onReset: () => void;
  onModificationSuccess: (updated: StudentInfo) => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ 
  student, onSubmit, isSubmitting, status, config, onReset, onModificationSuccess 
}) => {
  // Logic: 
  // 1. If student has NO status (new), allow editing immediately.
  // 2. If student has status 'Modifiable', allow editing immediately.
  const canEditDirectly = !student.status || student.status === 'Modifiable';
  
  const [isModifying, setIsModifying] = useState(canEditDirectly);
  const [modReqLoading, setModReqLoading] = useState(false);
  const [modError, setModError] = useState<string | null>(null);
  
  const [form, setForm] = useState<UniformRequest>({
    shirt: (student.existingShirt as UniformSize) || '',
    trousers: (student.existingTrousers as UniformSize) || '',
    jacket: (student.existingJacket as UniformSize) || '',
    notes: ''
  });

  const handleModRequest = async () => {
    setModReqLoading(true);
    setModError(null);
    try {
      const ok = await requestModification(student.studentId);
      if (ok) {
        const updated = await searchStudent(student.studentId);
        if (updated) onModificationSuccess(updated);
      } else {
        setModError("The request could not be completed at this time.");
      }
    } catch (err: any) {
      setModError(err.message || "Connection error.");
    } finally {
      setModReqLoading(false);
    }
  };

  const handleRefresh = async () => {
    setModReqLoading(true);
    try {
      const updated = await searchStudent(student.studentId);
      if (updated) onModificationSuccess(updated);
    } finally {
      setModReqLoading(false);
    }
  };

  const hasExistingData = !!(student.existingShirt || student.existingTrousers || student.existingJacket);
  const approvalRequired = config.modification === 'enabled';
  const isWaitState = approvalRequired && student.status === 'ModificationRequested';
  const showReadOnly = hasExistingData && !isModifying && student.status !== 'Modifiable';

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-12 border border-green-100 text-center animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Saved!</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">Your uniform sizes have been submitted for review. Thank you.</p>
        <button 
          onClick={onReset} 
          className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Return to Search
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="bg-blue-50/50 px-8 py-4 border-b border-blue-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Student Profile</h3>
          </div>
          {student.status && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              student.status === 'Approved' ? 'bg-green-100 text-green-700' : 
              student.status === 'Pending' ? 'bg-blue-100 text-blue-700' : 
              student.status === 'Modifiable' ? 'bg-indigo-100 text-indigo-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {student.status === 'ModificationRequested' ? 'Status: Pending Approval' : 
               student.status === 'Modifiable' ? 'Status: Ready to Modify' : `Status: ${student.status}`}
            </span>
          )}
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name (English)</p><p className="text-lg font-bold text-gray-900">{student.englishName}</p></div>
          <div className="text-right font-arabic" dir="rtl"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest" dir="ltr">الاسم (عربي)</p><p className="text-lg font-bold text-gray-900">{student.arabicName}</p></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Class Information</p><p className="text-gray-700 font-medium">{student.grade} - {student.className}</p></div>
          <div className="text-right"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student ID</p><p className="text-gray-700 font-medium">{student.studentId}</p></div>
        </div>
      </div>

      {isWaitState ? (
        <div className="bg-white rounded-2xl shadow-soft p-12 border border-amber-100 text-center space-y-4">
           <Hourglass className="h-12 w-12 text-amber-500 mx-auto animate-pulse" />
           <h3 className="text-xl font-bold text-gray-900">Staff Approval Required</h3>
           <p className="text-gray-600 max-w-md mx-auto font-medium">
             You have requested to change your uniform sizes. This is currently being reviewed by school staff.
           </p>
           <div className="pt-4 flex flex-col items-center gap-3">
             <button onClick={handleRefresh} disabled={modReqLoading} className="flex items-center gap-2 px-6 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold border border-amber-200">
               {modReqLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="h-4 w-4" /> Refresh Status</>}
             </button>
             <button onClick={onReset} className="text-gray-400 text-sm font-bold flex items-center gap-2 hover:text-gray-600"><LogOut className="h-4 w-4" /> Return to Search</button>
           </div>
        </div>
      ) : showReadOnly ? (
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <h3 className="text-xl font-bold text-gray-900">Submitted Sizes</h3>
               <p className="text-sm text-gray-500">To change these, click the button below.</p>
             </div>
             <button 
                onClick={approvalRequired ? handleModRequest : () => setIsModifying(true)}
                disabled={modReqLoading}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100"
             >
               {modReqLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Edit3 className="h-4 w-4" /> {approvalRequired ? 'Request Modification' : 'Modify Sizes'}</>}
             </button>
          </div>
          {modError && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {modError}</div>}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">Shirt</p><p className="text-2xl font-black text-gray-900">{student.existingShirt || '-'}</p></div>
            <div className="p-4 bg-gray-50 rounded-xl text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">Trousers</p><p className="text-2xl font-black text-gray-900">{student.existingTrousers || '-'}</p></div>
            <div className="p-4 bg-gray-50 rounded-xl text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">Jacket</p><p className="text-2xl font-black text-gray-900">{student.existingJacket || '-'}</p></div>
          </div>
          <div className="pt-2 text-center">
             <button onClick={onReset} className="text-gray-400 text-sm font-bold hover:text-gray-600">Back to Search</button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 space-y-8 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Uniform Size Selection</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['shirt', 'trousers', 'jacket'] as const).map((item) => (
              <div key={item} className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">{item}</label>
                <select 
                  value={form[item]} 
                  onChange={(e) => setForm(f => ({ ...f, [item]: e.target.value as UniformSize }))}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                >
                  <option value="">Select Size</option>
                  {UNIFORM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Additional Notes</label>
            <textarea 
              placeholder="Any special fitting instructions..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <button 
              type="submit" disabled={isSubmitting}
              style={{ backgroundColor: PRIMARY_BLUE }}
              className="w-full py-4 text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Sizes"}
            </button>
            <button type="button" onClick={onReset} className="w-full py-2 text-gray-400 font-bold text-sm hover:text-gray-600">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RequestForm;
