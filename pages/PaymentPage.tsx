
import React, { useEffect } from 'react';
import { PackageForPaymentDisplay } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { TicketIcon } from '../components/Icons';

interface PaymentPageProps {
  packageToPurchase: PackageForPaymentDisplay;
  onBack: () => void;
}

const YAMPI_SCRIPT_SRC = "https://api.yampi.io/v2/kairos-hub/public/buy-button/DMJG1YHLT7/js";

const PaymentPage: React.FC<PaymentPageProps> = ({ packageToPurchase, onBack }) => {
  const { user, isAuthenticated, showAuthModal } = useAuth();
  const accentColorName = packageToPurchase.accentColor.split('-')[1] || 'sky';

  useEffect(() => {
    if (!isAuthenticated) {
      // Prevent script injection if user is not logged in.
      return;
    }

    const scriptId = 'yampi-buy-button-script';
    // Remove existing script to avoid duplicates on re-render
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = YAMPI_SCRIPT_SRC;
    script.className = 'ymp-script';
    script.async = true;

    // The script will look for a container with this ID to place the button
    const container = document.getElementById('yampi-button-container');
    if (container) {
        container.innerHTML = ''; // Clear previous button before appending new one
        container.appendChild(script);
    }

    return () => {
      // Cleanup script when component unmounts
      const scriptElement = document.getElementById(scriptId);
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, [isAuthenticated]); // Re-run effect if authentication state changes

  const handleLoginRedirect = () => {
      showAuthModal('login');
  }

  return (
    <section id="payment" className="py-16 md:py-24 bg-slate-900 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-2xl">
        <div className={`bg-slate-800 shadow-2xl rounded-xl overflow-hidden border-2 border-${accentColorName}-500/70`}>
          <div className={`p-6 sm:p-8 bg-slate-800/60 border-b-2 border-slate-700/50`}>
            <h2 className={`text-3xl font-bold text-center mb-2 ${packageToPurchase.accentColor}`}>Finalizar Aquisição</h2>
            <p className="text-slate-300 text-center text-lg mb-1">Você está adquirindo: <strong className={packageToPurchase.accentColor}>{packageToPurchase.title}</strong></p>
            
            {packageToPurchase.discountApplied && packageToPurchase.originalPrice && (
              <div className="text-center my-3 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                <p className="text-sm text-slate-400">
                  Preço Original: <span className="line-through">R$ {packageToPurchase.originalPrice.toFixed(2).replace(".", ",")}</span>
                </p>
                <p className={`text-lg font-semibold text-green-400 flex items-center justify-center`}>
                  <TicketIcon className="w-5 h-5 mr-1.5"/> Desconto KAIROS: -{packageToPurchase.discountApplied.percentage}%
                </p>
                <p className="text-xs text-slate-500">(Válido até: {new Date(packageToPurchase.discountApplied.expiry).toLocaleDateString('pt-BR')})</p>
              </div>
            )}
            <p className={`text-2xl font-semibold text-center ${packageToPurchase.accentColor} mb-6`}>
              Total: {packageToPurchase.priceDisplay}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {isAuthenticated ? (
              <div className="text-center">
                <h3 className="text-xl font-semibold text-sky-400 mb-3">Complete sua compra</h3>
                <p className="text-slate-400 mb-6">Clique no botão abaixo para ser redirecionado para um ambiente de pagamento seguro.</p>
                {/* This container is where the Yampi button will be injected */}
                <div id="yampi-button-container" className="flex justify-center [&>div]:w-full [&>div]:max-w-xs mx-auto"></div>
                 <div className="text-xs text-slate-500 mt-4">
                    Ao continuar, você será redirecionado para o checkout da Yampi.
                </div>
              </div>
            ) : (
                <div className="text-center p-4 bg-slate-700/50 rounded-md">
                    <h3 className="text-xl font-semibold text-amber-400 mb-3">Acesso Necessário</h3>
                    <p className="text-slate-300 mb-6">Você precisa estar logado para continuar com a compra. Por favor, faça login ou crie sua conta.</p>
                    <button
                        onClick={handleLoginRedirect}
                        className={`w-full max-w-xs mx-auto px-6 py-3 text-base font-semibold rounded-md transition-all duration-150 shadow-lg
                        bg-sky-600 text-white hover:bg-sky-500
                        transform hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-400`}
                    >
                        Fazer Login ou Cadastrar
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                 <button
                    onClick={onBack}
                    className={`w-full px-6 py-3 text-base font-semibold rounded-md transition-all duration-150
                    border-2 border-slate-600 text-slate-300 hover:border-${accentColorName}-500 hover:text-white
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-${accentColorName}-400`}
                >
                    Voltar
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentPage;
