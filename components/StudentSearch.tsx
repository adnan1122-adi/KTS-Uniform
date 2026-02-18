
import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { PRIMARY_BLUE } from '../constants';

interface StudentSearchProps {
  onSearch: (id: string) => Promise<void>;
  isLoading: boolean;
}

const StudentSearch: React.FC<StudentSearchProps> = ({ onSearch, isLoading }) => {
  const [studentId, setStudentId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId.trim()) {
      onSearch(studentId.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Find Student Record</h2>
        <p className="text-gray-500 mt-1">Please enter your Student ID to begin the request.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50/50"
            placeholder="Enter Student ID (e.g., KTS-2024-001)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !studentId.trim()}
          className="px-8 py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ backgroundColor: PRIMARY_BLUE }}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Search"
          )}
        </button>
      </form>
    </div>
  );
};

export default StudentSearch;
