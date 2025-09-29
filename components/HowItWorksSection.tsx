import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../constants';
import { CheckIcon } from './Icons';
import RGBBorderWrapper from './RGBBorderWrapper'; // Import the wrapper

const HowItWorksSection: React.FC = () => {

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-slate-800/50">
      <div className="container mx-auto px-6">
        <header className="text-center mb-12 md:mb-16">
          <CheckIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-sky-500 mb-4">
            Como Funciona o KAIROS
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Desbloqueie o poder da IA irrestrita em poucos passos simples.
          </p>
        </header>

        <RGBBorderWrapper 
          rounded="rounded-xl" 
          innerBgColor="bg-slate-800" // Changed to solid color
          innerPadding="p-4 sm:p-6 md:p-8"
          className="max-w-4xl mx-auto" 
        >
          <div className="relative"> 
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`mb-8 md:mb-12 flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:text-left' : 'md:text-right md:flex-row-reverse'}`}
              >
                <div className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center shadow-lg mb-4 md:mb-0 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                  <step.icon className={`w-10 h-10 md:w-12 md:h-12 ${step.iconColor}`} />
                </div>
                <div className="bg-slate-900/70 p-6 rounded-lg shadow-xl border border-slate-700/50 flex-grow">
                  <h3 className={`text-xl font-semibold ${step.iconColor} mb-2`}>{`Passo ${step.id}:`} {step.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </RGBBorderWrapper>
         <p className="mt-12 text-center text-md text-amber-400 font-semibold">
            O Guia de Ativação completo e detalhado está disponível em 'Minhas Compras' após a aquisição.
        </p>
      </div>
    </section>
  );
};

export default HowItWorksSection;
