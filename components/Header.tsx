
import React from 'react';
import { SCHOOL_NAME, PRIMARY_BLUE } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 py-6 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            KTS
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {SCHOOL_NAME}
            </h1>
            <p className="text-gray-500 text-sm font-medium">Uniform Size Request System</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
