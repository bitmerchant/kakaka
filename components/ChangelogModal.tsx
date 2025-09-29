
// components/ChangelogModal.tsx
import React from 'react';
import { SparklesIcon, CheckIcon } from './Icons';
import { CHANGELOG_DATA } from '../constants';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-title"
    >
      <div
        className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border-2 border-purple-500/50 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-4">
          <h3 id="changelog-title" className="text-xl font-bold text-purple-400 flex items-center">
            <SparklesIcon className="w-6 h-6 mr-2" />
            Novidades e Atualizações
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

        <div className="overflow-y-auto flex-grow pr-2 custom-scrollbar space-y-6">
          {CHANGELOG_DATA.map(item => (
            <div key={item.version}>
                <h4 className="font-bold text-lg text-sky-300">{item.version} <span className="text-sm font-normal text-slate-400">- {item.date}</span></h4>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    {item.changes.map((change, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start">
                           <CheckIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 shrink-0" />
                           <span>{change}</span>
                        </li>
                    ))}
                </ul>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-700 mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-500"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
