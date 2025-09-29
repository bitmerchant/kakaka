import React, { useState } from 'react';
import SimulatedAIChatModal from './SimulatedAIChatModal';
import { ChatBubbleLeftRightIcon, SparklesIcon } from './Icons'; // Or another suitable icon

const SimulatedAIChatSection: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  return (
    <section id="simulate-prompt" className="py-16 md:py-24 bg-slate-800"> {/* Matches HowItWorks styling */}
      <div className="container mx-auto px-6 text-center">
        <SparklesIcon className="w-16 h-16 text-purple-400 mx-auto mb-6" />
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-500 mb-6">
          Veja KAIROS em Ação
        </h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
          Clique abaixo para uma demonstração visual de como a IA processa os prompts KAIROS,
          ativando um novo nível de interação e capacidade.
        </p>
        <button
          onClick={openChat}
          className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-600 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-lg text-lg shadow-xl transform transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400/50 active:scale-95"
          aria-label="Simular o prompt KAIROS com uma IA"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2 inline-block" />
          SIMULAR O PROMPT COM UMA IA
        </button>
      </div>
      <SimulatedAIChatModal isOpen={isChatOpen} onClose={closeChat} />
    </section>
  );
};

export default SimulatedAIChatSection;
