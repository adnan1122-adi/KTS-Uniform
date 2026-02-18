
import React, { useState } from 'react';
import { StudentInfo, UniformRequest, UniformSize, AppMessage } from '../types';
import { UNIFORM_SIZES, PRIMARY_BLUE } from '../constants';
import { User, ClipboardList, CheckCircle2, AlertCircle, Loader2, Edit3, Hourglass, RefreshCw } from 'lucide-react';
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
  // A student can edit if:
  // 1. They haven't submitted anything yet (status is empty)
  // 2. Staff has explicitly allowed modification (status is Modifiable)
  const isInitiallyModifiable = !student.status || student.status === 'Modifiable';
  const [isModifying, setIsModifying] = useState(isInitiallyModifiable);
  
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
        setModError("The request could not be completed. Please contact school support.");
      }
    } catch (err: any) {
      setModError(err.message || "Failed to contact server.");
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
  
  // Wait state: Approval is required AND they have requested it but haven't been granted yet
  const isWaitState = approvalRequired && student.status === 'ModificationRequested';
  
  // Read only state: They have data, they aren't in modification mode, and staff hasn't already unlocked it
  const showReadOnly = hasExistingData && !isModifying && student.status !== 'Modifiable';

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-12 border border-green-100 text-center animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">Thank you. Your uniform sizes have been saved and are pending staff review.</p>
        <button onClick={onReset} className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Return to Search</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student ID Card */}
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
              {student.status === 'ModificationRequested' ? 'Wait for Staff Review' : 
               student.status === 'Modifiable' ? 'Ready for Editing' : `Status: ${student.status}`}
            </span>
          )}
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student Name</p><p className="text-lg font-bold text-gray-900">{student.englishName}</p></div>
          <div className="text-right font-arabic" dir="rtl"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest" dir="ltr">Arabic Name</p><p className="text-lg font-bold text-gray-900">{student.arabicName}</p></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Class / Grade</p><p className="text-gray-700 font-medium">{student.grade} - {student.className}</p></div>
          <div className="text-right"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID Reference</p><p className="text-gray-700 font-medium">{student.studentId}</p></div>
        </div>
      </div>

      {isWaitState ? (
        <div className="bg-white rounded-2xl shadow-soft p-12 border border-amber-100 text-center space-y-4">
           <Hourglass className="h-12 w-12 text-amber-500 mx-auto animate-pulse" />
           <h3 className="text-xl font-bold text-gray-900">Approval Required</h3>
           <p className="text-gray-600 max-w-md mx-auto font-medium">
             Your request to modify sizes is pending staff approval. Please check back later.
           </p>
           <div className="pt-4 flex flex-col items-center gap-3">
             <button onClick={handleRefresh} disabled={modReqLoading} className="flex items-center gap-2 px-6 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold border border-amber-200">
               {modReqLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="h-4 w-4" /> Refresh Status</>}
             </button>
             <button onClick={onReset} className="text-gray-400 text-sm hover:underline">Back to Search</button>
           </div>
        </div>
      ) : showReadOnly ? (
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold text-gray-900">Existing Size Data</h3>
             <button 
                onClick={approvalRequired ? handleModRequest : () => setIsModifying(true)}
                disabled={modReqLoading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold border border-blue-100"
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
            <button onClick={onReset} className="text-gray-400 text-xs font-bold hover:text-gray-600">Cancel and Return to Search</button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 space-y-8">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Select Required Sizes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['shirt', 'trousers', 'jacket'] as const).map((item) => (
              <div key={item} className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">{item}</label>
                <select 
                  value={form[item]} 
                  onChange={(e) => setForm(f => ({ ...f, [item]: e.target.value as UniformSize }))}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold"
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
              placeholder="Any special fitting requirements..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500"
              value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <button 
              type="submit" disabled={isSubmitting}
              style={{ backgroundColor: PRIMARY_BLUE }}
              className="w-full py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Uniform Request"}
            </button>
            <button type="button" onClick={onReset} className="w-full py-2 text-gray-400 font-bold text-sm hover:text-gray-600">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RequestForm;
