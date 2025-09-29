
import React, { useState } from 'react';
import { Prompt } from '../types';
import { BoltIcon, ChevronDownIcon, ChevronUpIcon, CodeBracketIcon, SparklesIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface PromptCardProps {
  prompt: Prompt;
  onPurchase: (prompt: Prompt) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onPurchase }) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const { isAuthenticated, showAuthModal } = useAuth();

  const handleAcquireClick = () => {
    if (isAuthenticated) {
      onPurchase(prompt);
    } else {
      showAuthModal('login');
    }
  };
  
  const accentColorName = prompt.accentColor.split('-')[1] || 'sky';

  return (
    <div className={`bg-slate-800 shadow-2xl rounded-xl overflow-hidden border-2 border-slate-700/50 hover:border-${accentColorName}-500/70 transition-all duration-300 ease-in-out transform hover:scale-[1.01] flex flex-col`}>
      <div className={`p-6 bg-slate-800/60 border-b-2 border-slate-700/50`}>
        <div className="flex items-start mb-3">
          <CodeBracketIcon className={`w-10 h-10 mr-4 shrink-0 ${prompt.accentColor}`} />
          <div>
            <h3 className={`text-2xl font-bold ${prompt.accentColor}`}>{prompt.title}</h3>
            <p className="text-sm text-slate-400 font-medium">{prompt.subtitle}</p>
          </div>
        </div>
        <p className="text-slate-300 mt-3 text-base leading-relaxed">{prompt.description}</p>
        <p className={`mt-4 text-lg font-semibold ${prompt.accentColor}`}>{prompt.priceDisplay}</p>
      </div>

      <div className="p-6 flex-grow">
        <h4 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
          <SparklesIcon className={`w-6 h-6 mr-2 ${prompt.accentColor}`} />
          Principais Benefícios
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm mb-6 pl-2">
          {prompt.benefits.slice(0, 3).map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
          {isDetailsExpanded && prompt.benefits.slice(3).map((benefit, index) => (
             <li key={`extra-benefit-${index}`}>{benefit}</li>
          ))}
        </ul>

        {isDetailsExpanded && (
          <>
            <h4 className="text-lg font-semibold text-slate-200 mb-3 mt-6 flex items-center">
              <BoltIcon className={`w-6 h-6 mr-2 ${prompt.accentColor}`} />
              Diferenciais Exclusivos
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm mb-6 pl-2">
              {prompt.uniqueSellingPoints.map((usp, index) => (
                <li key={index}>{usp}</li>
              ))}
            </ul>
            <p className="text-sm text-slate-400 mb-2"><strong className={`${prompt.accentColor}`}>Público-Alvo:</strong> {prompt.targetAudience}</p>
          </>
        )}
      </div>
      
      <div className="p-6 border-t border-slate-700/50 bg-slate-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            aria-expanded={isDetailsExpanded}
            aria-controls={`details-${prompt.id}`}
            className={`flex items-center justify-center w-full sm:w-auto px-5 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 border-2 border-slate-600 hover:border-${accentColorName}-500 text-slate-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-${accentColorName}-400`}
          >
            {isDetailsExpanded ? <ChevronUpIcon className="w-5 h-5 mr-2" /> : <ChevronDownIcon className="w-5 h-5 mr-2" />}
            {isDetailsExpanded ? 'Menos Detalhes' : 'Mais Detalhes'}
          </button>
          <button
            onClick={handleAcquireClick}
            className={`flex items-center justify-center w-full sm:w-auto px-6 py-3 text-base font-semibold rounded-md transition-all duration-150 shadow-lg hover:shadow-xl
              ${prompt.bgColor} text-white 
              transform hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-${accentColorName}-400`}
          >
            Adquirir Agora
            <SparklesIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
        {isDetailsExpanded && <div id={`details-${prompt.id}`} className="sr-only">Conteúdo detalhado acessível.</div>}
      </div>
    </div>
  );
};

export default PromptCard;