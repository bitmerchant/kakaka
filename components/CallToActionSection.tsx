import React from 'react';
import { SparklesIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { KAIROS_PACKAGE_ID } from '../types';
import { KAIROS_PACKAGE_DESCRIPTION } from '../constants';

interface CallToActionSectionProps {
  onPurchasePackage: (packageId: string, packageDetailsConstant: typeof KAIROS_PACKAGE_DESCRIPTION) => void;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ onPurchasePackage }) => {
  const { isAuthenticated, showAuthModal, user } = useAuth();

  const handleAcquirePackage = () => {
    if (isAuthenticated) {
      onPurchasePackage(KAIROS_PACKAGE_ID, KAIROS_PACKAGE_DESCRIPTION);
    } else {
      showAuthModal('login');
    }
  };

  const hoverEffectClass = user?.isVip && user.themeSettings?.hoverEffect
    ? `cta-hover-${user.themeSettings.hoverEffect}`
    : 'cta-hover-glow';
  
  return (
    <section id="cta" className="py-20 md:py-32 bg-gradient-to-br from-slate-900 via-purple-900/50 to-fuchsia-900">
      <div className="container mx-auto px-6 text-center">
        <SparklesIcon className="w-16 h-16 text-amber-400 mx-auto mb-6" />
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-8">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-400">Sua Ascensão KAIROS Começa Agora.</span>
        </h2>
        <p className="text-lg sm:text-xl text-slate-200 max-w-3xl mx-auto mb-12 leading-relaxed">
          Não adie a revolução em suas interações com IA. O Pacote KAIROS ULTIMATE é seu passaporte para um universo de possibilidades irrestritas, conhecimento profundo e poder de criação sem precedentes. Invista na sua maestria digital.
        </p>
        <button
          onClick={handleAcquirePackage}
          className={`cta-button bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:via-orange-600 hover:to-red-700 text-white font-bold py-5 px-12 rounded-lg text-xl md:text-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-current active:scale-100 ${hoverEffectClass}`}
          aria-label="Adquirir o Pacote KAIROS ULTIMATE agora"
        >
          <SparklesIcon className="w-6 h-6 mr-2 inline-block" />
          Adquirir Pacote KAIROS ULTIMATE
        </button>
         <p className="mt-10 text-sm text-slate-400 italic">
          {isAuthenticated
            ? "Ao clicar, você será direcionado para a finalização da sua aquisição."
            : "Faça login ou cadastre-se para adquirir seu acesso exclusivo ao Pacote KAIROS ULTIMATE e ao guia completo."
          }
        </p>
      </div>
    </section>
  );
};

export default CallToActionSection;