
import React, { useEffect } from 'react';
import { SparklesIcon, CheckIcon } from './Icons';

interface PurchaseSuccessOverlayProps {
  isOpen: boolean;
  onClose: () => void; // onClose will navigate to MyPurchases
}

const PurchaseSuccessOverlay: React.FC<PurchaseSuccessOverlayProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-[200] p-4 text-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="success-overlay-title"
    >
      <div className="animate-pulse">
        <SparklesIcon className="w-24 h-24 text-amber-400 mx-auto mb-6" />
      </div>
      <h2 id="success-overlay-title" className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500">
          Bem-vindo ao KAIROS ULTIMATE!
        </span>
      </h2>
      <p className="text-xl sm:text-2xl text-slate-200 mb-8 max-w-xl">
        Sua transformação começa agora. O Pacote KAIROS foi desbloqueado!
      </p>
      <div className="flex items-center justify-center p-3 rounded-full bg-green-500/20 border-2 border-green-500 mb-8 animate-bounce">
        <CheckIcon className="w-10 h-10 text-green-400" />
      </div>
      <p className="text-slate-400 text-sm">
        Você será redirecionado para suas compras em instantes...
      </p>
    </div>
  );
};

export default PurchaseSuccessOverlay;
