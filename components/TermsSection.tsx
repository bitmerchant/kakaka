
import React from 'react';
import { LEGAL_DOCUMENTS_DATA } from '../constants';
import { ShieldCheckIcon, LifebuoyIcon } from './Icons'; // LifebuoyIcon for policy
import { ViewState } from '../types';

interface TermsSectionProps {
  onNavigate: (view: ViewState, params?: any) => void;
}

const TermsSection: React.FC<TermsSectionProps> = ({ onNavigate }) => {
  return (
    <section id="terms" className="py-16 md:py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <header className="text-center mb-12 md:mb-16">
          <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500 mb-4">
            Termos e Políticas
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Informações importantes sobre responsabilidade, garantia e suporte. Clique para ler.
          </p>
        </header>
        <div className="max-w-3xl mx-auto space-y-6">
          {LEGAL_DOCUMENTS_DATA.map((doc) => {
            const IconComponent = doc.icon || ShieldCheckIcon; // Fallback icon
            return (
              <div
                key={doc.id}
                onClick={() => onNavigate('legalDoc', { docId: doc.id })}
                className="bg-slate-800/60 p-6 rounded-xl shadow-xl border-2 border-slate-700/80 hover:border-sky-500/70 transition-all duration-300 ease-in-out transform hover:scale-[1.02] cursor-pointer group flex items-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigate('legalDoc', { docId: doc.id })}
                aria-label={`Visualizar ${doc.title}`}
              >
                <IconComponent className={`w-10 h-10 sm:w-12 sm:h-12 mr-4 sm:mr-6 shrink-0 ${doc.accentColor} group-hover:opacity-80 transition-colors`} />
                <div className="flex-grow">
                  <h3 className={`text-lg sm:text-xl font-semibold ${doc.accentColor} group-hover:opacity-80 transition-colors`}>{doc.title}</h3>
                  <p className="text-sm text-slate-400">Clique para ler os detalhes completos.</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-500 group-hover:text-sky-400 transition-colors ml-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
            );
          })}
        </div>
         <p className="mt-10 text-center text-xs text-slate-500">
            Ao utilizar nossos serviços, você concorda com estes termos e políticas.
          </p>
      </div>
    </section>
  );
};

export default TermsSection;