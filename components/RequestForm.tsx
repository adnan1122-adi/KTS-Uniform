
import React, { useState } from 'react';
import { StudentInfo, UniformRequest, AppMessage } from '../types';
import { GREEN_UNIFORM_SIZES, BEIGE_PANT_SIZES, SKORT_SIZES, PRIMARY_BLUE } from '../constants';
import { User, ClipboardList, CheckCircle2, AlertCircle, Loader2, Edit3, Hourglass, RefreshCw, LogOut, Phone, UserCircle } from 'lucide-react';
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
  const canEditDirectly = !student.status || student.status === 'Modifiable';
  
  const [isModifying, setIsModifying] = useState(canEditDirectly);
  const [modReqLoading, setModReqLoading] = useState(false);
  const [modError, setModError] = useState<string | null>(null);

  // Sync isModifying when student data changes (e.g., after search or refresh)
  React.useEffect(() => {
    setIsModifying(!student.status || student.status === 'Modifiable');
  }, [student.status, student.studentId]);
  
  const [form, setForm] = useState<UniformRequest>({
    parentName: student.parentName || '',
    mobileNo: student.mobileNo || '',
    greenHoodie: student.greenHoodie || '',
    greenPant: student.greenPant || '',
    greenPolo: student.greenPolo || '',
    whiteTshirt: student.whiteTshirt || '',
    beigePant: student.beigePant || '',
    skort: student.skort || '',
    notes: student.notes || ''
  });

  // Helper to check grade range
  const isGradeInRange = (grade: string, start: string, end: string) => {
    const grades = [
      'KG1', 'KG2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
      'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
    ];
    const startIndex = grades.indexOf(start);
    const endIndex = grades.indexOf(end);
    const currentIndex = grades.indexOf(grade);
    
    if (startIndex === -1 || currentIndex === -1) return false;
    if (endIndex === -1) return currentIndex >= startIndex;
    return currentIndex >= startIndex && currentIndex <= endIndex;
  };

  const showSkort = student.gender === 'بنات' && isGradeInRange(student.grade, 'KG1', 'Grade 4');
  const showBeigePant = (student.gender === 'بنين' && isGradeInRange(student.grade, 'KG1', 'Grade 12')) || 
                        (student.gender === 'بنات' && isGradeInRange(student.grade, 'Grade 5', 'Grade 12'));

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

  const hasExistingData = !!(student.greenHoodie || student.greenPant || student.greenPolo || student.whiteTshirt || student.beigePant || student.skort);
  const approvalRequired = config.modification === 'disabled';
  const isWaitState = student.status === 'ModificationRequested' || student.status === 'Pending';
  const showReadOnly = hasExistingData && !isModifying && !isWaitState && student.status !== 'Modifiable';

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-12 border border-green-100 text-center animate-in fade-in zoom-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Saved!</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {student.status === 'Modifiable' && config.modification === 'disabled'
            ? "Your modified sizes have been submitted for final approval. Thank you." 
            : "Your uniform sizes have been submitted successfully. Thank you."}
        </p>
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
               student.status === 'Modifiable' ? 'Status: Ready to Modify' : 
               student.status === 'Pending' ? 'Status: Awaiting Final Approval' : `Status: ${student.status}`}
            </span>
          )}
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student Name</p><p className="text-lg font-bold text-gray-900">{student.englishName}</p></div>
          <div className="text-right"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student ID</p><p className="text-lg font-bold text-gray-900">{student.studentId}</p></div>
          <div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grade</p><p className="text-gray-700 font-medium">{student.grade}</p></div>
          <div className="text-right"><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gender</p><p className="text-gray-700 font-medium">{student.gender}</p></div>
        </div>
      </div>

      {isWaitState ? (
        <div className="bg-white rounded-2xl shadow-soft p-12 border border-amber-100 text-center space-y-4">
           <Hourglass className="h-12 w-12 text-amber-500 mx-auto animate-pulse" />
           <h3 className="text-xl font-bold text-gray-900">
             {student.status === 'Pending' ? 'Final Approval Pending' : 'Modification Request Pending'}
           </h3>
           <p className="text-gray-600 max-w-md mx-auto font-medium">
             {student.status === 'Pending' 
               ? "Your updated sizes have been submitted. Please wait for staff to review and approve."
               : "Your request to modify sizes is being reviewed. Please wait 24H for modification approval."}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {student.greenHoodie && <div className="p-4 bg-gray-50 rounded-xl text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">Hoodie</p><p className="text-xl font-black text-gray-900">{student.greenHoodie}</p></div>}
            {student.greenPant && <div className="p-4 bg-gray-50 rounded-xl text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">Pant</p><p className="text-xl font-black text-gray-900">{student.greenPant}</p></div>}
            {student.greenPolo && <div className="p-4 bg-gray-50 rounded-xl text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">Polo</p><p className="text-xl font-black text-gray-900">{student.greenPolo}</p></div>}
            {student.whiteTshirt && <div className="p-4 bg-gray-50 rounded-xl text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">T-Shirt</p><p className="text-xl font-black text-gray-900">{student.whiteTshirt}</p></div>}
            {student.beigePant && <div className="p-4 bg-gray-50 rounded-xl text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">Beige Pant</p><p className="text-xl font-black text-gray-900">{student.beigePant}</p></div>}
            {student.skort && <div className="p-4 bg-gray-50 rounded-xl text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">Skort</p><p className="text-xl font-black text-gray-900">{student.skort}</p></div>}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <UserCircle className="h-3 w-3" /> Parent Name
              </label>
              <input 
                type="text"
                required
                placeholder="Enter parent full name"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={form.parentName}
                onChange={(e) => setForm(f => ({ ...f, parentName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <Phone className="h-3 w-3" /> Mobile Number
              </label>
              <input 
                type="tel"
                required
                placeholder="05xxxxxxxx"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={form.mobileNo}
                onChange={(e) => setForm(f => ({ ...f, mobileNo: e.target.value }))}
              />
            </div>
          </div>

          {!(showSkort || showBeigePant) ? (
            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-bold">No uniform selection available for this grade/gender combination.</p>
              <p className="text-sm mt-1">Please contact the school administration for assistance.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Green Hoodie</label>
                <select 
                  value={form.greenHoodie} 
                  onChange={(e) => setForm(f => ({ ...f, greenHoodie: e.target.value }))}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                >
                  <option value="">Select Size</option>
                  {GREEN_UNIFORM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Green Pant</label>
                <select 
                  value={form.greenPant} 
                  onChange={(e) => setForm(f => ({ ...f, greenPant: e.target.value }))}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                >
                  <option value="">Select Size</option>
                  {GREEN_UNIFORM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Green Polo</label>
                <select 
                  value={form.greenPolo} 
                  onChange={(e) => setForm(f => ({ ...f, greenPolo: e.target.value }))}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                >
                  <option value="">Select Size</option>
                  {GREEN_UNIFORM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">White T-Shirt</label>
                <select 
                  value={form.whiteTshirt} 
                  onChange={(e) => setForm(f => ({ ...f, whiteTshirt: e.target.value }))}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                >
                  <option value="">Select Size</option>
                  {GREEN_UNIFORM_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {showBeigePant && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Beige Pant</label>
                  <select 
                    value={form.beigePant} 
                    onChange={(e) => setForm(f => ({ ...f, beigePant: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  >
                    <option value="">Select Size</option>
                    {BEIGE_PANT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {showSkort && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Skort</label>
                  <select 
                    value={form.skort} 
                    onChange={(e) => setForm(f => ({ ...f, skort: e.target.value }))}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  >
                    <option value="">Select Size</option>
                    {SKORT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
          
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
              type="submit" disabled={isSubmitting || !(showSkort || showBeigePant)}
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
