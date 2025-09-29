
import React from 'react';
import { GUARANTEE_SUPPORT_TEXT } from '../constants';
import { ShieldCheckIcon, LifebuoyIcon } from '../components/Icons';

const PolicyPage: React.FC = () => {

  const formatPolicyText = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      if (trimmedParagraph.startsWith('*   ')) { 
        return <li key={index} className="ml-5 mb-1.5 text-slate-300 list-disc list-outside">{trimmedParagraph.substring(4)}</li>;
      }
       if (trimmedParagraph.startsWith('**') && trimmedParagraph.endsWith('**')) { 
        return <h3 key={index} className="text-lg font-semibold text-sky-300 mt-4 mb-2">{trimmedParagraph.replace(/\*\*/g, '')}</h3>;
      }
      if (trimmedParagraph) { 
        return <p key={index} className="mb-3 text-slate-300 leading-relaxed text-sm">{trimmedParagraph}</p>;
      }
      return null;
    });
  };


  return (
    <section id="policy" className="py-16 md:py-24 bg-slate-900 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12 md:mb-16">
          <LifebuoyIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-4">
            Política de Garantia e Suporte
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Nossa política de garantia e suporte para o KAIROS Prompt Hub.
          </p>
        </header>

        <div className="max-w-3xl mx-auto bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl border-2 border-slate-700/80">
          <div className="prose prose-sm prose-invert max-w-none">
             {formatPolicyText(GUARANTEE_SUPPORT_TEXT)}
          </div>
          <div className="mt-8 text-center">
            <ShieldCheckIcon className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Estamos comprometidos em fornecer um produto de qualidade e suporte transparente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PolicyPage;