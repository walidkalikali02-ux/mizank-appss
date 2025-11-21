import React from 'react';
import { MealLog } from '../types';
import { Trash2, Clock, Flame } from 'lucide-react';

interface LogListProps {
  logs: MealLog[];
  onDelete: (id: string) => void;
  t: any;
}

export const LogList: React.FC<LogListProps> = ({ logs, onDelete, t }) => {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {/* Empty State Vector Illustration */}
        <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-80">
          <circle cx="120" cy="100" r="80" fill="#f0fdf4" />
          <path d="M120 190C169.706 190 210 149.706 210 100H30C30 149.706 70.2944 190 120 190Z" fill="#dcfce7"/>
          <rect x="70" y="60" width="100" height="80" rx="10" fill="white" stroke="#86efac" strokeWidth="2"/>
          <circle cx="120" cy="100" r="25" fill="#bbf7d0" />
          <path d="M120 100L135 85" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/>
          <path d="M150 70L160 60M80 70L90 60M120 50V40" stroke="#86efac" strokeWidth="2" strokeLinecap="round"/>
          <path d="M60 110H40M200 110H180" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        <h3 className="text-lg font-semibold text-gray-800">{t.noMeals}</h3>
        <p className="text-gray-500 max-w-xs mt-2">
            {t.snapPhoto}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
         <div className="w-1 h-6 bg-brand-500 rounded-full"></div>
         <h3 className="text-lg font-bold text-gray-800">{t.todaysMeals}</h3>
      </div>
      
      {logs.map((log) => (
        <div key={log.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-lg hover:shadow-gray-200/40 hover:-translate-y-0.5 group">
          {/* Optional Image Thumbnail */}
          {log.imageUrl ? (
            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
              <img src={log.imageUrl} alt="Meal" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
          ) : (
            <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-brand-50 flex items-center justify-center text-brand-200">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                     <path d="M18 19C18 20.6569 16.6569 22 15 22H5C3.34315 22 2 20.6569 2 19V5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V13.5" />
                     <path d="M13 13L18 8L22 12" />
                 </svg>
            </div>
          )}
          
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 truncate text-lg">
                  {log.items.length > 0 ? log.items[0].name : log.description}
                  {log.items.length > 1 && <span className="text-gray-400 font-normal text-sm ms-2">+{log.items.length - 1} {t.more}</span>}
                </h4>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-medium">
                  <Clock size={12} />
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button 
                onClick={() => onDelete(log.id)}
                className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
                aria-label="Delete log"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2">
               <span className="flex items-center text-brand-700 bg-brand-100 px-2.5 py-1 rounded-lg text-xs font-bold">
                <Flame size={12} className="me-1 fill-brand-500" />
                {log.totalMacros.calories} {t.kcal}
              </span>
              <div className="flex gap-2 text-xs font-medium text-gray-500">
                 <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100">P: {log.totalMacros.protein}</span>
                 <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100">C: {log.totalMacros.carbs}</span>
                 <span className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100">F: {log.totalMacros.fat}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};