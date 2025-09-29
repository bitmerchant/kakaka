
import React from 'react';
import { FUTURE_FEATURES_PLACEHOLDERS } from '../constants';
import { ViewState } from '../types';

interface FooterProps {
  onNavigate?: (view: ViewState, params?: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {

  const handleFooterLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, view: ViewState, params?: any, sectionId?: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(view, params);
      if (view === 'main' && sectionId) {
        // Allow scrolling to section if it's on the main page and not a modal trigger
        setTimeout(() => {
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                const navbarHeight = (document.querySelector('nav')?.offsetHeight || 64);
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        },0);
      }
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 space-x-2 sm:space-x-4">
          <a
            href="#terms"
            onClick={(e) => handleFooterLinkClick(e, 'legalDoc', { docId: 'terms' })}
            className="text-sky-400 hover:text-sky-300 hover:underline text-sm transition-colors"
          >
            Termos de Responsabilidade e Uso
          </a>
          <span className="text-slate-600">|</span>
          <a
            href="#policy"
            onClick={(e) => handleFooterLinkClick(e, 'legalDoc', { docId: 'policy' })}
            className="text-sky-400 hover:text-sky-300 hover:underline text-sm transition-colors"
          >
            Política de Garantia e Suporte
          </a>
          <span className="text-slate-600">|</span>
           <a
            href="#blog"
            onClick={(e) => handleFooterLinkClick(e, 'blogList')}
            className="text-sky-400 hover:text-sky-300 hover:underline text-sm transition-colors"
          >
            Centro de Conhecimento KAIROS
          </a>
        </div>

        <div className="mb-6 text-xs text-slate-500 space-y-1">
            <p>{FUTURE_FEATURES_PLACEHOLDERS.additionalPackagesText}</p>
            <p>{FUTURE_FEATURES_PLACEHOLDERS.referralProgramText}</p>
            <p>{FUTURE_FEATURES_PLACEHOLDERS.subscriptionPlanText}</p>
        </div>

        <p className="text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} KAIROS Prompt Hub. Todos os direitos reservados.
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Prompts projetados para exploração avançada de IA. Use com discernimento.
        </p>
      </div>
    </footer>
  );
};

export default Footer;