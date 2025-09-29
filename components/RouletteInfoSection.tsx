import React from 'react';
import { TicketIcon } from './Icons';
import { ViewState } from '../types';

interface RouletteInfoSectionProps {
  onNavigate: (view: ViewState, params?: any) => void;
}

const RouletteInfoSection: React.FC<RouletteInfoSectionProps> = ({ onNavigate }) => {
  return (
    <section id="roulette-info" className="py-16 md:py-24 bg-slate-800/70">
      <div className="container mx-auto px-6 text-center">
        <TicketIcon className="w-16 h-16 text-amber-400 mx-auto mb-6 animate-pulse" />
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500 mb-4">
          Como Funciona a Roleta KAIROS?
        </h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Participe da Roleta KAIROS e concorra a cupons exclusivos de desconto!
          Os cupons podem ser usados diretamente na finalização da sua compra e ficam disponíveis por 24 horas na sua conta.
        </p>
        <button
          onClick={() => onNavigate('roulette')}
          className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-xl transform transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-400/50 active:scale-95"
          aria-label="Ir para a Roleta KAIROS"
        >
          <TicketIcon className="w-5 h-5 mr-2 inline"/>
          Ir para a Roleta KAIROS
        </button>
      </div>
    </section>
  );
};

export default RouletteInfoSection;
