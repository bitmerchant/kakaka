
import React from 'react';
import { LegalDocument } from '../types';
import { formatGuideText } from '../pages/MyPurchasesPage'; // Re-use or adapt formatting

interface LegalDocModalProps {
  item: LegalDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

const LegalDocModal: React.FC<LegalDocModalProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  const IconComponent = item.icon;

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`legaldoc-title-${item.id}`}
    >
      <div
        className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-3xl border-2 border-sky-500/50 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-4">
          <h3 id={`legaldoc-title-${item.id}`} className={`text-xl sm:text-2xl font-bold ${item.accentColor} flex items-center`}>
            {IconComponent && <IconComponent className={`w-7 h-7 mr-2.5 shrink-0 ${item.accentColor}`} />}
            {item.title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-grow pr-2 text-sm custom-scrollbar">
          <div className="prose prose-sm prose-invert max-w-none">
            {/* Use the same formatting function as the guide for consistency */}
            {formatGuideText(item.content)}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700 mt-4 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-colors bg-sky-600 text-white hover:bg-sky-500`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalDocModal;