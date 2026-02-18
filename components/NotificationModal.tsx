
import React from 'react';
import { AppMessage } from '../types';
import { Bell, X, Check } from 'lucide-react';
import { PRIMARY_BLUE } from '../constants';

interface NotificationModalProps {
  message: AppMessage;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ message, onClose }) => {
  if (!message.english && !message.arabic) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-blue-50/50 p-6 flex items-center justify-between border-b border-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-bold text-gray-900">Important Announcement</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {message.english && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">English</p>
              <p className="text-gray-700 leading-relaxed text-lg">{message.english}</p>
            </div>
          )}

          {message.arabic && (
            <div className="space-y-2 text-right">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest" dir="rtl">اللغة العربية</p>
              <p className="text-gray-700 leading-relaxed text-xl font-arabic" dir="rtl">{message.arabic}</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 flex justify-center border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-10 py-3 rounded-xl text-white font-bold transition-all transform hover:scale-[1.05] active:scale-[0.95] flex items-center gap-2"
            style={{ backgroundColor: PRIMARY_BLUE }}
          >
            <Check className="h-5 w-5" />
            I Understand | فهمت
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
