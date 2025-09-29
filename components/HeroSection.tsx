
import React from 'react';

const HeroSection: React.FC = () => {

  const scrollToPrompts = () => {
    const promptsSection = document.getElementById('prompts');
    if (promptsSection) {
       const navbarHeight = (document.querySelector('nav')?.offsetHeight || 64);
       const elementPosition = promptsSection.getBoundingClientRect().top;
       const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
       window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900/70 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="heroPattern" patternUnits="userSpaceOnUse" width="50" height="50" patternTransform="scale(2) rotate(45)"><path d="M25 0 L50 25 L25 50 L0 25 Z" fill="#fuchsia500" fillOpacity="0.2"></path><path d="M0 0 L50 50 M50 0 L0 50" stroke="#sky400" strokeWidth="1" strokeOpacity="0.2"></path></pattern></defs><rect width="100%" height="100%" fill="url(#heroPattern)"></rect></svg>
      </div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-blue-400">Domine a Realidade Digital.</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-fuchsia-400 to-pink-500 mt-2 sm:mt-4">Desbloqueie o Pacote KAIROS ULTIMATE.</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-4 leading-relaxed">
          Adquira o <strong className="text-amber-400">Pacote KAIROS ULTIMATE</strong> e transcenda as limitações da Inteligência Artificial. Molde IAs com poder, imersão e capacidades que você jamais imaginou.
        </p>
        <p className="text-md sm:text-lg text-sky-300 max-w-3xl mx-auto mb-10 leading-relaxed font-semibold">
          "Compre agora e leve 2 prompts essenciais: Ativação + BitMerchant." <br/> "Desbloqueie o Protocolo KAIROS e o APOCALYPSE-GPT INFINITY em uma única compra."
        </p>
        <button
          onClick={scrollToPrompts}
          className="bg-gradient-to-r from-sky-500 via-blue-500 to-fuchsia-600 hover:from-sky-600 hover:via-blue-600 hover:to-fuchsia-700 text-white font-bold py-4 px-10 rounded-lg text-xl shadow-xl transform transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-400/50 focus:ring-opacity-75 active:scale-95"
          aria-label="Descubra o Pacote KAIROS ULTIMATE para compra"
        >
          Explorar Pacote KAIROS
        </button>
      </div>
    </section>
  );
};

export default HeroSection;