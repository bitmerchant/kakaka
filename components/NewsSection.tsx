
// components/NewsSection.tsx
import React from 'react';
import { CHANGELOG_DATA } from '../constants';
import { SparklesIcon, ArrowRightIcon } from './Icons';

interface NewsSectionProps {
  onShowChangelog: () => void;
}

const NewsSection: React.FC<NewsSectionProps> = ({ onShowChangelog }) => {
  const latestUpdates = CHANGELOG_DATA.slice(0, 2); // Show the latest 2 updates

  return (
    <section id="news" className="py-12 bg-slate-800/50">
      <div className="container mx-auto px-6">
        <header className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-purple-400">
            Novidades KAIROS
          </h2>
          <p className="text-md text-slate-400 max-w-xl mx-auto mt-2">
            Fique por dentro das últimas atualizações e melhorias da plataforma.
          </p>
        </header>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {latestUpdates.map(item => (
            <div key={item.version} className="bg-slate-800 p-5 rounded-lg border border-slate-700">
              <h3 className="font-bold text-lg text-sky-400">{item.version} <span className="text-sm font-normal text-slate-500">- {item.date}</span></h3>
              <ul className="mt-2 text-sm text-slate-300 list-disc list-inside space-y-1">
                {item.changes.slice(0, 2).map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button
            onClick={onShowChangelog}
            className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 group"
          >
            Ver todas as novidades <ArrowRightIcon className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
