import React from 'react';
import { PROMPTS_DATA, KAIROS_PACKAGE_DESCRIPTION, FUTURE_FEATURES_PLACEHOLDERS } from '../constants';
import { KAIROS_PACKAGE_ID, Prompt as PromptType } from '../types';
import { BoltIcon, CodeBracketIcon, SparklesIcon, CheckIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import RGBBorderWrapper from './RGBBorderWrapper'; // Import the wrapper

interface PromptsSectionProps {
  onPurchasePackage: (packageId: string, packageDetailsConstant: typeof KAIROS_PACKAGE_DESCRIPTION) => void;
}

const IncludedPromptDetail: React.FC<{prompt: PromptType}> = ({ prompt }) => (
  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-all">
    <div className="flex items-center mb-2">
      <CodeBracketIcon className={`w-7 h-7 mr-3 shrink-0 ${prompt.accentColor}`} />
      <div>
        <h4 className={`text-lg font-semibold ${prompt.accentColor}`}>{prompt.title}</h4>
        <p className="text-xs text-slate-400">{prompt.subtitle}</p>
      </div>
    </div>
    <p className="text-sm text-slate-300 mb-2 leading-relaxed">{prompt.description}</p>
    <ul className="space-y-1 text-xs text-slate-400">
      {prompt.benefits.slice(0,2).map((benefit, idx) => (
        <li key={idx} className="flex items-start">
          <CheckIcon className="w-3 h-3 mr-1.5 mt-0.5 text-green-400 shrink-0" />
          {benefit}
        </li>
      ))}
    </ul>
  </div>
);

const PromptsSection: React.FC<PromptsSectionProps> = ({ onPurchasePackage }) => {
  const { isAuthenticated, showAuthModal } = useAuth();

  const activationPrompt = PROMPTS_DATA.find(p => p.type === 'base');
  const masterPrompt = PROMPTS_DATA.find(p => p.type === 'master');

  const handleAcquireClick = () => {
    if (isAuthenticated) {
      onPurchasePackage(KAIROS_PACKAGE_ID, KAIROS_PACKAGE_DESCRIPTION);
    } else {
      showAuthModal('login');
    }
  };

  return (
    <section id="prompts" className="py-16 md:py-24 bg-slate-900">
      <div className="container mx-auto px-6">
        <header className="text-center mb-12 md:mb-16">
          <BoltIcon className={`w-16 h-16 mx-auto mb-6 ${KAIROS_PACKAGE_DESCRIPTION.accentColor}`} />
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${KAIROS_PACKAGE_DESCRIPTION.accentColor} mb-4`}>
            {KAIROS_PACKAGE_DESCRIPTION.title}
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-3">
            {KAIROS_PACKAGE_DESCRIPTION.description}
          </p>
          <p className="text-md sm:text-lg text-sky-300 max-w-3xl mx-auto leading-relaxed font-semibold">
            "Pacote completo para maximizar seus resultados!"
          </p>
        </header>

        <RGBBorderWrapper
          rounded="rounded-xl"
          innerBgColor="bg-slate-800" // The original card background
          innerPadding="p-0" // Original card had padding inside its children, so wrapper's direct child has p-0
          className="overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-transform duration-300 ease-in-out"
          contentClassName="flex flex-col" // Ensure inner content div also takes full height
        >
          {/* Original content of the card goes here, remove its own border/bg/rounded properties */}
          <div className="p-6 md:p-8"> {/* This was the original padding of the card */}
            <h3 className="text-2xl font-semibold text-slate-100 mb-3">O que está incluído nesta única compra:</h3>
            <p className="text-slate-400 mb-6">
              Este pacote essencial combina os dois prompts fundamentais para a experiência KAIROS completa. Você recebe ambos ao adquirir o Pacote KAIROS ULTIMATE:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {activationPrompt && <IncludedPromptDetail prompt={activationPrompt} />}
              {masterPrompt && <IncludedPromptDetail prompt={masterPrompt} />}
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
              <h4 className="text-xl font-semibold text-slate-200 mb-3 flex items-center">
                <SparklesIcon className={`w-7 h-7 mr-2 ${KAIROS_PACKAGE_DESCRIPTION.accentColor}`} />
                Benefícios do Pacote Completo:
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-sm mb-6 pl-2">
                {KAIROS_PACKAGE_DESCRIPTION.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>

              <h4 className="text-xl font-semibold text-slate-200 mb-3 mt-6 flex items-center">
                <BoltIcon className={`w-7 h-7 mr-2 ${KAIROS_PACKAGE_DESCRIPTION.accentColor}`} />
                Diferenciais Exclusivos:
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-sm mb-6 pl-2">
                {KAIROS_PACKAGE_DESCRIPTION.uniqueSellingPoints.map((usp, index) => (
                  <li key={index}>{usp}</li>
                ))}
              </ul>
              <p className="text-sm text-slate-400 mb-2 mt-4">
                <strong className={`${KAIROS_PACKAGE_DESCRIPTION.accentColor}`}>Público-Alvo Ideal:</strong> {KAIROS_PACKAGE_DESCRIPTION.targetAudience}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 border-t border-slate-700/50 bg-slate-800/40 text-center mt-auto"> {/* mt-auto for sticky footer effect if contentClassName is flex flex-col */}
            <p className={`my-4 text-3xl font-bold ${KAIROS_PACKAGE_DESCRIPTION.accentColor}`}>
              {KAIROS_PACKAGE_DESCRIPTION.priceDisplay}
            </p>
            <button
              onClick={handleAcquireClick}
              className={`w-full max-w-md mx-auto flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-md transition-all duration-150 shadow-lg hover:shadow-xl
              ${KAIROS_PACKAGE_DESCRIPTION.bgColor} text-white
              transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400`}
            >
              Adquirir Pacote KAIROS ULTIMATE
              <SparklesIcon className="w-6 h-6 ml-3" />
            </button>
            <p className="mt-4 text-xs text-slate-500">
              “Compre agora e leve os 2 prompts essenciais: Ativação + BitMerchant. Ambos incluídos em uma única compra para sua maestria digital.”
            </p>
          </div>
        </RGBBorderWrapper>

        <div className="text-center mt-12 space-y-2">
          <p className="text-sm text-slate-500">{FUTURE_FEATURES_PLACEHOLDERS.additionalPackagesText}</p>
          <p className="text-sm text-slate-500">{FUTURE_FEATURES_PLACEHOLDERS.subscriptionPlanText}</p>
        </div>
      </div>
    </section>
  );
};

export default PromptsSection;
