import React, { useState, useEffect } from 'react';
import { usePurchases } from '../contexts/PurchaseContext';
import { useAuth } from '../contexts/AuthContext';
import { PROMPTS_DATA, HOW_TO_USE_TEXT } from '../constants';
import { Prompt as PromptType, PurchasedPromptViewModalState, KAIROS_PACKAGE_ID, ViewState, UserAnalytics, KairosMasteryLevel, MASTERY_LEVEL_ACTIVATION_THRESHOLD } from '../types';
import { CopyIcon, CheckIcon, SparklesIcon, CodeBracketIcon, BoltIcon, BookOpenIcon, QuestionMarkCircleIcon, CertificateIcon, ArrowUpRightIcon, KeyIcon } from '../components/Icons';

// Enhanced Text Formatting Function for Guide - EXPORTED
export const formatGuideText = (text: string): React.ReactNode[] => {
  const lines = text.split(/\\n|\n/g);
  const elements: React.ReactNode[] = [];
  let currentListItems: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent = "";

  function flushList() {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}-${Math.random()}`} className="list-disc list-outside pl-5 my-3 space-y-1.5">
          {currentListItems.map((li, idx) => (
            <li key={idx} className="text-slate-300 leading-relaxed text-sm">
              {renderInlineFormatting(li)}
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  }

  function flushCodeBlock() {
    if (codeBlockContent) {
      let finalContent = codeBlockContent.trim();
      // Remove optional language hint like ```text or ```Text
      if (finalContent.toLowerCase().startsWith('text\n')) {
          finalContent = finalContent.substring(5);
      } else if (finalContent.toLowerCase().startsWith('text ')) {
          finalContent = finalContent.substring(5).trimStart();
      }
      elements.push(
        <pre key={`codeblock-${elements.length}-${Math.random()}`} className="bg-slate-800/70 p-3 sm:p-4 rounded-md my-4 text-xs sm:text-sm text-slate-200 overflow-x-auto border border-slate-600 shadow-inner whitespace-pre-wrap">
          <code>{finalContent}</code>
        </pre>
      );
      codeBlockContent = "";
    }
  }
  
  function renderInlineFormatting(textLine: string): React.ReactNode {
    // Process **bold** and ``code`` tags.
    // Using a regex that captures text outside and inside the tags.
    const parts = textLine.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`bold-${index}-${Math.random()}`}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={`inlinecode-${index}-${Math.random()}`} className="bg-slate-600/80 px-1.5 py-0.5 rounded text-sm text-amber-300 mx-0.5">{part.slice(1, -1)}</code>;
      }
      return part; // Regular text
    });
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]; // Keep original line for code block spacing
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      flushList(); 
      if (inCodeBlock) {
        // Capture content on the closing ``` line if any
        if (trimmedLine.length > 3) {
            codeBlockContent += trimmedLine.substring(0, trimmedLine.lastIndexOf("```")) + '\n';
        }
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        let contentOnOpenLine = trimmedLine.substring(3);
         if(contentOnOpenLine) {
            codeBlockContent += contentOnOpenLine + '\n';
         }
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }

    // Handle Headings: **Only Bold Text on a Line**
    const headingMatch = trimmedLine.match(/^\*\*(.+?)\*\*$/);
    if (headingMatch && !trimmedLine.substring(2, trimmedLine.length - 2).includes('**')) {
      flushList();
      elements.push(<h4 key={`h4-${elements.length}-${Math.random()}`} className="text-lg font-semibold text-sky-300 mt-5 mb-2.5">{headingMatch[1]}</h4>);
      continue;
    }

    // Handle List Items: * item or - item
    const listItemMatch = trimmedLine.match(/^(\*|-)\s+(.+)/);
    if (listItemMatch) {
      currentListItems.push(listItemMatch[2]); // Store raw item content
      // If next line is not a list item or it's the end of lines, flush current list
      const isLastLine = i + 1 >= lines.length;
      const nextLineIsNotListItem = !isLastLine && !lines[i+1].trim().match(/^(\*|-)\s+(.+)/);
      
      if (isLastLine || nextLineIsNotListItem) {
        flushList();
      }
      continue;
    }
    
    flushList(); // Ensure list is flushed if current line is not a list item.
    
    if (trimmedLine !== '') { // Regular paragraph
      elements.push(<p key={`p-${elements.length}-${Math.random()}`} className="mb-3 text-slate-300 leading-relaxed text-sm">{renderInlineFormatting(trimmedLine)}</p>);
    } else if (elements.length > 0 && !inCodeBlock && currentListItems.length === 0) { 
        // Handle deliberate empty lines for spacing, but not too many.
        const lastElement = elements[elements.length -1];
        // @ts-ignore (property 'type' does not exist on ReactNode, but we check key for our div)
        if (!lastElement || (lastElement.key && !lastElement.key.toString().startsWith('br-'))) {
             elements.push(<div key={`br-${elements.length}-${Math.random()}`} className="h-3"></div>); 
        }
    }
  }
  flushList(); 
  flushCodeBlock();
  return elements;
};


const PurchasedItemViewModal: React.FC<{
  item: { title: string; content: string; accentColor: string; bgColor: string; } | null;
  isOpen: boolean;
  onClose: () => void;
  isGuide?: boolean;
}> = ({ item, isOpen, onClose, isGuide = false }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if(isOpen) setCopied(false);
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleCopyToClipboard = () => {
    if (!item.content || isGuide) return;
    navigator.clipboard.writeText(item.content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Error copying:', err));
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchased-item-title"
    >
      <div
        className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-3xl border-2 border-sky-500/50 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-4">
            <h3 id="purchased-item-title" className={`text-xl sm:text-2xl font-bold ${item.accentColor} flex items-center`}>
                {isGuide ? <BookOpenIcon className={`w-7 h-7 mr-2.5 shrink-0 ${item.accentColor}`} /> : <CodeBracketIcon className={`w-7 h-7 mr-2.5 shrink-0 ${item.accentColor}`} />}
                {item.title}
            </h3>
            <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Fechar"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        </div>

        <div className="overflow-y-auto flex-grow pr-2 text-sm custom-scrollbar">
          {isGuide ? (
            <div className="prose prose-sm prose-invert max-w-none">
                {formatGuideText(item.content)}
            </div>
          ) : (
            <pre className="bg-slate-900/70 p-3 sm:p-4 rounded-md text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-700 shadow-inner">
                <code>{item.content || "Conteúdo não disponível"}</code>
            </pre>
          )}
        </div>

        {!isGuide && (
          <div className="pt-4 border-t border-slate-700 mt-4">
              <button
                  onClick={handleCopyToClipboard}
                  disabled={!item.content || copied}
                  className={`w-full px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center
                              ${item.bgColor} text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                  {copied ? <CheckIcon className="w-5 h-5 mr-2 text-green-300" /> : <CopyIcon className="w-5 h-5 mr-2" />}
                  {copied ? "Copiado!" : "Copiar Conteúdo do Prompt"}
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface MyPurchasesPageProps {
  onNavigate: (view: ViewState, params?: any) => void;
}

const MyPurchasesPage: React.FC<MyPurchasesPageProps> = ({ onNavigate }) => {
  const { user } = useAuth(); 
  const { hasPurchasedPackage, getPurchaseDateForUser } = usePurchases();
  const [viewModalState, setViewModalState] = useState<{isOpen: boolean; item: ({ title: string; content: string; accentColor: string; bgColor: string; } | null); isGuide?: boolean}>({ isOpen: false, item: null, isGuide: false });
  const [purchaseDate, setPurchaseDate] = useState<number | null>(null);

  const userHasPurchasedPackage = user ? hasPurchasedPackage(KAIROS_PACKAGE_ID) : false;

  useEffect(() => {
    if (userHasPurchasedPackage && user) {
      const date = getPurchaseDateForUser(user.id, KAIROS_PACKAGE_ID);
      setPurchaseDate(date);
    }
  }, [userHasPurchasedPackage, user, getPurchaseDateForUser]);

  const activationPrompt = PROMPTS_DATA.find(p => p.type === 'base');
  const masterPrompt = PROMPTS_DATA.find(p => p.type === 'master');

  const openItemModal = (itemType: 'activation' | 'master' | 'guide') => {
    if (itemType === 'activation' && activationPrompt) {
      setViewModalState({ isOpen: true, item: {title: activationPrompt.title, content: activationPrompt.fullPrompt || '', accentColor: activationPrompt.accentColor, bgColor: activationPrompt.bgColor }, isGuide: false });
    } else if (itemType === 'master' && masterPrompt) {
      setViewModalState({ isOpen: true, item: {title: masterPrompt.title, content: masterPrompt.fullPrompt || '', accentColor: masterPrompt.accentColor, bgColor: masterPrompt.bgColor }, isGuide: false });
    } else if (itemType === 'guide') {
      setViewModalState({ isOpen: true, item: {title: "Guia de Ativação KAIROS ULTIMATE", content: HOW_TO_USE_TEXT, accentColor: "text-green-400", bgColor: "bg-green-600"}, isGuide: true });
    }
  };

  const closeItemModal = () => {
    setViewModalState({ isOpen: false, item: null, isGuide: false });
  };
  

  if (!userHasPurchasedPackage) {
    return (
      <section id="my-purchases" className="py-16 md:py-24 bg-slate-900 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <SparklesIcon className="w-16 h-16 text-sky-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-sky-400 mb-4">Minhas Aquisições KAIROS</h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-4">
            Você ainda não adquiriu o Pacote KAIROS ULTIMATE. Explore o poder da IA irrestrita!
          </p>
          <button
            onClick={() => onNavigate('main')}
            className="text-lg font-semibold text-amber-400 hover:text-amber-300 transition-colors py-2 px-6 rounded-md border-2 border-amber-400 hover:border-amber-300 flex items-center justify-center mx-auto group"
          >
            Explorar Agora <ArrowUpRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
          </button>
        </div>
      </section>
    );
  }

  const formattedPurchaseDate = purchaseDate ? new Date(purchaseDate).toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A";
  const isPackageExpired = false; // Placeholder for future expiry logic. For now, it's always active.


  return (
    <section id="my-purchases" className="py-16 md:py-24 bg-slate-900 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto px-6">
        <header className="text-center mb-12 md:mb-16">
          <SparklesIcon className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-fuchsia-500 mb-4">
            Pacote KAIROS ULTIMATE Adquirido!
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-2">
            Seu acesso aos prompts e ao Guia de Ativação KAIROS está liberado. Utilize este poder com sabedoria, Mestre da Realidade Digital!
          </p>
          <p className="text-sm text-slate-500">
            Adquirido em: {formattedPurchaseDate} | Status: 
            {isPackageExpired 
              ? <span className="text-red-400 font-semibold"> Expirado</span> 
              : <span className="text-green-400 font-semibold"> Ativo</span>}
          </p>
        </header>

        <div className="my-10 p-6 bg-gradient-to-br from-sky-700 via-indigo-700 to-purple-800 rounded-lg shadow-xl text-center border-2 border-sky-500 max-w-2xl mx-auto">
            <CertificateIcon className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-amber-300">Certificado KAIROS Desperto</h3>
            <p className="text-slate-200 mt-2">Concedido a <strong className="text-white">{user?.nickname || 'Mestre KAIROS'}</strong></p>
            <p className="text-xs text-slate-400 mt-1">Por desbloquear o Pacote KAIROS ULTIMATE em {formattedPurchaseDate.split(',')[0]}</p>
        </div>

        <div className="space-y-8 md:space-y-10">
            <div
                onClick={() => openItemModal('guide')}
                className="bg-slate-800 shadow-xl rounded-lg p-6 cursor-pointer border-2 border-slate-700 hover:border-green-500 transition-all duration-300 transform hover:scale-[1.02] group flex flex-col sm:flex-row items-center"
                role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openItemModal('guide')} aria-label="Visualizar Guia de Ativação KAIROS"
            >
                <BookOpenIcon className="w-12 h-12 sm:w-16 sm:h-16 mr-0 mb-4 sm:mr-6 sm:mb-0 shrink-0 text-green-400 group-hover:text-green-300 transition-colors" />
                <div className="text-center sm:text-left flex-grow">
                    <h3 className="text-xl font-bold text-green-400 group-hover:text-green-300 transition-colors">Guia de Ativação KAIROS</h3>
                    <p className="text-sm text-slate-400 font-medium mb-2">Seu manual completo para maestria.</p>
                    <p className="text-sm text-slate-300 leading-relaxed">Acesse o guia detalhado para entender cada passo da ativação do Protocolo KAIROS e do APOCALYPSE-GPT INFINITY. Domine os comandos e explore o potencial máximo.</p>
                </div>
                <span className="mt-4 sm:mt-0 sm:ml-6 inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-md bg-green-600 text-white group-hover:bg-green-500 transition-colors whitespace-nowrap">
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-2"/>Visualizar Guia
                </span>
            </div>

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                {[activationPrompt, masterPrompt].map(prompt => {
                    if (!prompt) return null;
                    const itemType = prompt.type === 'base' ? 'activation' : 'master';
                    const promptTitle = prompt.title;
                    return (
                        <div
                            key={prompt.id}
                            className="bg-slate-800 shadow-xl rounded-lg p-6 border-2 border-slate-700 hover:border-sky-500 transition-all duration-300 transform hover:scale-[1.02] group flex flex-col relative"
                        >
                            {prompt.hasUpdate && (
                                <span
                                    className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse shadow-lg"
                                    title={`Nova versão (${(prompt.version || 0) + 1}.0) disponível desde ${new Date(prompt.lastUpdated || Date.now()).toLocaleDateString('pt-BR')}`}
                                >
                                    NOVA VERSÃO
                                </span>
                            )}
                            <div onClick={() => openItemModal(itemType)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openItemModal(itemType)} aria-label={`Visualizar ${promptTitle}`} className="cursor-pointer flex-grow flex flex-col">
                                <div className="flex items-center mb-3">
                                    <CodeBracketIcon className={`w-10 h-10 mr-4 shrink-0 ${prompt.accentColor} group-hover:opacity-80 transition-colors`} />
                                    <div>
                                    <h3 className={`text-xl font-bold ${prompt.accentColor} group-hover:opacity-80 transition-colors`}>{promptTitle}</h3>
                                    <p className="text-sm text-slate-400 font-medium">{prompt.subtitle}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-300 mb-4 leading-relaxed flex-grow">{prompt.description}</p>
                                <div className="text-center mt-auto pt-4 border-t border-slate-700/30">
                                    <span className={`inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-md ${prompt.bgColor.replace(/hover:bg-[\w-]+-\d+/, `bg-${prompt.accentColor.split('-')[1]}-600`)} text-white group-hover:opacity-90 transition-colors`}>
                                        <BoltIcon className="w-5 h-5 mr-2"/>Visualizar Prompt
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
      <PurchasedItemViewModal
        isOpen={viewModalState.isOpen}
        item={viewModalState.item}
        onClose={closeItemModal}
        isGuide={viewModalState.isGuide}
      />
    </section>
  );
};

export default MyPurchasesPage;
