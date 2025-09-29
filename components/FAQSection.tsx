
import React, { useState } from 'react';
import { FAQ_DATA } from '../constants';
import { FAQItem as FAQItemType } from '../types'; 
import { QuestionMarkCircleIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

const FAQItemComponent: React.FC<{ item: FAQItemType }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-700">
      <h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-full py-5 text-left text-slate-200 hover:text-sky-400 transition-colors"
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${item.question.replace(/\s+/g, '-')}`}
        >
          <span className="text-lg font-medium">{item.question}</span>
          {isOpen ? <ChevronUpIcon className="w-5 h-5 text-sky-400" /> : <ChevronDownIcon className="w-5 h-5" />}
        </button>
      </h3>
      {isOpen && (
        <div
          id={`faq-answer-${item.question.replace(/\s+/g, '-')}`}
          className="pb-5 pr-4 text-slate-300 leading-relaxed text-sm"
          role="region"
        >
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQSection: React.FC = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-slate-800/70">
      <div className="container mx-auto px-6">
        <header className="text-center mb-12 md:mb-16">
          <QuestionMarkCircleIcon className="w-16 h-16 text-sky-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-500 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Respostas rápidas para suas dúvidas mais comuns sobre o KAIROS Prompt Hub.
          </p>
        </header>
        <div className="max-w-3xl mx-auto bg-slate-900/50 p-6 sm:p-8 rounded-xl shadow-xl border border-slate-700">
          {FAQ_DATA.map((item, index) => (
            <FAQItemComponent key={index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;