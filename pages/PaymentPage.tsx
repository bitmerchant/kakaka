
import React from 'react';
import { PIX_CODE_COPIA_COLA, AwardedDiscount, PackageForPaymentDisplay } from '../types'; 
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, CheckIcon, CopyIcon, TicketIcon } from '../components/Icons'; 

interface PaymentPageProps {
  packageToPurchase: PackageForPaymentDisplay; 
  onPaymentSuccess: () => void; 
  onBack: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ packageToPurchase, onPaymentSuccess, onBack }) => {
  const { user, isAuthenticated, showAuthModal } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const handleConfirmPayment = () => {
    if (!isAuthenticated) {
        showAuthModal('login'); // Prompt login/register if not authenticated
        return;
    }
    onPaymentSuccess(); 
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(PIX_CODE_COPIA_COLA)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Erro ao copiar:', err));
  };
  
  const accentColorName = packageToPurchase.accentColor.split('-')[1] || 'sky';

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
            <div className="text-center">
              <h3 className="text-xl font-semibold text-sky-400 mb-3">Pague com PIX</h3>
              <p className="text-slate-400 mb-4">Escaneie o QR Code abaixo com o app do seu banco:</p>
              <div className="flex justify-center mb-4">
                <img 
                  src="/assets/qr.png" 
                  alt="PIX QR Code" 
                  className="w-56 h-56 md:w-64 md:h-64 border-4 border-sky-400 rounded-lg shadow-lg bg-white p-1" 
                />
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-lg font-semibold text-slate-300 mb-2">Ou use o PIX Copia e Cola:</h4>
              <div className="relative bg-slate-700 p-3 rounded-md border border-slate-600">
                <p className="text-sky-300 text-xs sm:text-sm break-all select-all pr-10">{PIX_CODE_COPIA_COLA}</p>
                <button 
                    onClick={handleCopyToClipboard} 
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-slate-400 hover:text-sky-400 p-1 rounded-md bg-slate-600 hover:bg-slate-500 transition-colors"
                    aria-label="Copiar código PIX"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-400 bg-slate-700/50 p-4 rounded-md border border-slate-600/50">
              <h4 className="font-semibold text-slate-200 mb-2">Instruções:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abra o aplicativo do seu banco e escolha a opção PIX.</li>
                <li>Selecione "Pagar com QR Code" ou "PIX Copia e Cola".</li>
                <li>Escaneie o QR Code ou cole o código acima.</li>
                <li>Confirme os dados e o valor.</li>
                <li>Após o pagamento, clique no botão "Já Realizei o Pagamento" abaixo.</li>
              </ol>
               <p className="mt-3 text-amber-400">Este é um processo simulado. Clique no botão abaixo para confirmar a "compra".</p>
               {!isAuthenticated && (
                <p className="mt-3 text-yellow-400 font-semibold">Você não está logado. Faça login ou cadastre-se para finalizar a compra e salvar seu progresso.</p>
               )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                 <button
                    onClick={onBack}
                    className={`w-full sm:w-1/2 px-6 py-3 text-base font-semibold rounded-md transition-all duration-150
                    border-2 border-slate-600 text-slate-300 hover:border-${accentColorName}-500 hover:text-white
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-${accentColorName}-400`}
                >
                    Voltar
                </button>
                <button
                    onClick={handleConfirmPayment}
                    className={`w-full sm:w-1/2 px-6 py-3 text-base font-semibold rounded-md transition-all duration-150 shadow-lg hover:shadow-xl
                    ${packageToPurchase.bgColor} text-white 
                    transform hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-${accentColorName}-400 flex items-center justify-center`}
                >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {isAuthenticated ? "Já Realizei o Pagamento (Simular)" : "Login/Cadastro para Pagar"}
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentPage;
