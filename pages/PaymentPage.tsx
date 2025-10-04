import React, { useState, useEffect, useCallback } from 'react';
import { PackageForPaymentDisplay } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, TicketIcon, EnvelopeIcon } from '../components/Icons';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface PaymentPageProps {
  packageToPurchase: PackageForPaymentDisplay;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ packageToPurchase, onPaymentSuccess, onBack }) => {
  const { user, isAuthenticated } = useAuth();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');

  const accentColorName = packageToPurchase.accentColor.split('-')[1] || 'sky';

  // Efeito para verificar a disponibilidade do SDK do Mercado Pago
  useEffect(() => {
    console.log("Verificando SDK do Mercado Pago...");
    if (window.MercadoPago) {
      console.log("SDK já estava pronto.");
      setIsSDKReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.MercadoPago) {
        console.log("SDK do Mercado Pago carregado.");
        setIsSDKReady(true);
        clearInterval(interval);
      }
    }, 500); // Verifica a cada 500ms
    return () => clearInterval(interval);
  }, []);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getPayerEmail = (): string | null => {
    if (isAuthenticated && user?.email) return user.email;
    if (!isAuthenticated && isValidEmail(guestEmail)) return guestEmail;
    return null;
  };

  const createPreference = useCallback(async () => {
    const payerEmail = getPayerEmail();
    if (!payerEmail) {
      setIsLoading(false);
      return;
    }

    console.log(`Iniciando criação da preferência para o e-mail: ${payerEmail}`);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/criar-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto: packageToPurchase.title,
          valor: packageToPurchase.price,
          email: payerEmail,
          origin: window.location.origin,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Falha ao criar a preferência de pagamento.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Não foi possível analisar a resposta de erro como JSON.", e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Preference ID recebida:", data.preferenceId);
      setPreferenceId(data.preferenceId);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [packageToPurchase, guestEmail, user, isAuthenticated]);

  useEffect(() => {
    if (getPayerEmail()) {
      createPreference();
    } else {
      setPreferenceId(null);
      setIsLoading(false);
    }
  }, [createPreference]);

  // Efeito para inicializar o PIX Brick, agora dependente do SDK e da preferenceId
  useEffect(() => {
    console.log(`Tentando renderizar o Brick. SDK pronto: ${isSDKReady}, Preference ID: ${preferenceId}`);
    if (preferenceId && isSDKReady) {
      console.log("Ambas as condições atendidas. Renderizando o PIX Brick...");
      const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
      if (!mpPublicKey) {
        console.error("Chave pública do Mercado Pago (VITE_MP_PUBLIC_KEY) não encontrada. Verifique o arquivo .env");
        setError("Erro de configuração: a chave pública do Mercado Pago não foi definida.");
        return;
      }

      const mp = new window.MercadoPago(mpPublicKey, { locale: 'pt-BR' });
      const bricksBuilder = mp.bricks();
      const containerId = "pix-container";

      const renderPixBrick = async () => {
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "";

        try {
          await bricksBuilder.create('pix', containerId, {
            initialization: {
              preferenceId: preferenceId,
            },
            customization: {
              visual: { copy_code_text: 'Copiar Código PIX', qr_code_text: 'Escanear QR Code' }
            },
            callbacks: {
              onReady: () => {
                console.log('PIX Brick pronto e renderizado!');
              },
              onError: (err) => {
                console.error('Erro no PIX Brick:', err);
                setError("Ocorreu um erro ao renderizar o QR Code do PIX.");
              },
              // O callback onSubmit não é padrão para o PIX Brick, que é mais informativo.
              // A confirmação do pagamento é feita pelo webhook.
              // A chamada onPaymentSuccess pode ser vinculada a outro evento se necessário,
              // ou removida se o fluxo depende apenas do webhook.
            },
          });
        } catch (e) {
            console.error("Falha ao chamar bricksBuilder.create:", e);
            setError("Falha crítica ao tentar criar o componente de pagamento.");
        }
      };

      renderPixBrick();
    }
  }, [preferenceId, isSDKReady]);

  const renderGuestEmailInput = () => (
    <div className="p-6 sm:p-8 space-y-4">
      <label htmlFor="guest-email" className="block text-lg font-semibold text-sky-400 text-center">
        Digite seu e-mail para gerar o QR Code PIX
      </label>
      <div className="relative">
        <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="email"
          id="guest-email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="seu.email@exemplo.com"
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>
      <p className="text-xs text-slate-500 text-center">Seu e-mail é usado apenas para o registro do pagamento.</p>
    </div>
  );

  const renderContent = () => {
    if (!isAuthenticated && !getPayerEmail()) {
      return renderGuestEmailInput();
    }

    if (isLoading || !isSDKReady) {
      let loadingMessage = "Gerando QR Code PIX...";
      if (!isSDKReady) loadingMessage = "Carregando gateway de pagamento...";
      if (isLoading && isSDKReady) loadingMessage = "Criando preferência de pagamento...";
      return <div className="text-center text-slate-300 p-8">{loadingMessage}</div>;
    }

    if (error) {
      return <div className="text-center text-red-400 p-8">{error}</div>;
    }

    return <div id="pix-container" className="p-6 sm:p-8"></div>;
  };

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
                  <TicketIcon className="w-5 h-5 mr-1.5" /> Desconto KAIROS: -{packageToPurchase.discountApplied.percentage}%
                </p>
              </div>
            )}
            <p className={`text-2xl font-semibold text-center ${packageToPurchase.accentColor} mb-2`}>
              Total: {packageToPurchase.priceDisplay}
            </p>
          </div>

          {renderContent()}

          <div className="p-6 sm:p-8 border-t-2 border-slate-700/50">
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
    </section>
  );
};

export default PaymentPage;