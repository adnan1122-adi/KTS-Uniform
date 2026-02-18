
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudentSearch from './components/StudentSearch';
import RequestForm from './components/RequestForm';
import AdminPortal from './components/AdminPortal';
import NotificationModal from './components/NotificationModal';
import { searchStudent, submitRequest, getMessage } from './services/api';
import { StudentInfo, UniformRequest, AppMode, AppMessage } from './types';
import { Shield, User } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.STUDENT);
  const [currentStudent, setCurrentStudent] = useState<StudentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [schoolMessage, setSchoolMessage] = useState<AppMessage>({ english: '', arabic: '', modification: 'enabled' });

  useEffect(() => {
    getMessage().then(msg => {
      setSchoolMessage(msg);
      if (msg.english || msg.arabic) setShowNotification(true);
    });
  }, []);

  const resetState = () => {
    setCurrentStudent(null);
    setSubmitStatus('idle');
    setError(null);
  };

  const handleSearch = async (id: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentStudent(null);
    setSubmitStatus('idle');
    try {
      const student = await searchStudent(id);
      if (student) setCurrentStudent(student);
      else setError("Student ID not found. Please verify your ID.");
    } catch (err: any) { 
      setError(err.message || "A connection error occurred."); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleSubmitRequest = async (request: UniformRequest) => {
    if (!currentStudent) return;
    setIsLoading(true);
    try {
      const result = await submitRequest(currentStudent, request);
      if (result.success) setSubmitStatus('success');
      else setSubmitStatus('error');
    } catch (err: any) { 
      setSubmitStatus('error'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const onModificationSuccess = (updatedStudent: StudentInfo) => {
    setCurrentStudent(updatedStudent);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      {showNotification && <NotificationModal message={schoolMessage} onClose={() => setShowNotification(false)} />}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-center">
          <nav className="flex gap-4 md:gap-8">
            <button 
              onClick={() => { setMode(AppMode.STUDENT); resetState(); }} 
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold transition-all ${mode === AppMode.STUDENT ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}
            >
              <User className="h-4 w-4" /> Parent Portal
            </button>
            <button 
              onClick={() => { setMode(AppMode.ADMIN); resetState(); }} 
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold transition-all ${mode === AppMode.ADMIN ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}
            >
              <Shield className="h-4 w-4" /> Staff Portal
            </button>
          </nav>
        </div>
      </div>
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {mode === AppMode.STUDENT ? (
          <div className="space-y-8">
            {!currentStudent && <StudentSearch onSearch={handleSearch} isLoading={isLoading} />}
            {error && !currentStudent && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            {currentStudent && (
              <RequestForm 
                config={schoolMessage} 
                student={currentStudent} 
                onSubmit={handleSubmitRequest} 
                isSubmitting={isLoading} 
                status={submitStatus}
                onReset={resetState}
                onModificationSuccess={onModificationSuccess}
              />
            )}
          </div>
        ) : <AdminPortal />}
      </main>
      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Knowledge Towers School. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;
