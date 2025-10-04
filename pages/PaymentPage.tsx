import React, { useState, useEffect, useCallback } from 'react';
import { PackageForPaymentDisplay } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, TicketIcon, EnvelopeIcon } from '../components/Icons';

// --- INSTRUÇÃO ---
// Para que o frontend funcione, crie um arquivo .env na raiz do projeto
// e adicione sua Public Key do Mercado Pago, como no exemplo abaixo:
// VITE_MP_PUBLIC_KEY=SUA_PUBLIC_KEY_AQUI

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');

  const accentColorName = packageToPurchase.accentColor.split('-')[1] || 'sky';

  // Função para validar email simples
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Determina o e-mail a ser usado e se está pronto para a criação da preferência
  const getPayerEmail = (): string | null => {
    if (isAuthenticated && user?.email) {
      return user.email;
    }
    if (!isAuthenticated && isValidEmail(guestEmail)) {
      return guestEmail;
    }
    return null;
  };

  // Função para criar a preferência de pagamento
  const createPreference = useCallback(async () => {
    const payerEmail = getPayerEmail();

    // Não prossegue se não houver um e-mail válido
    if (!payerEmail) {
        setIsLoading(false);
        // Não define um erro aqui, apenas espera a entrada do usuário
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/criar-preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produto: packageToPurchase.title,
          valor: packageToPurchase.price,
          email: payerEmail,
          origin: window.location.origin,
        }),
      });

      if (!response.ok) {
        // Tenta ler a resposta de erro como JSON, mas usa um fallback se falhar (ex: erro 404)
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
      setPreferenceId(data.preferenceId);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [packageToPurchase, guestEmail, user, isAuthenticated]);

  // Efeito para criar a preferência assim que um e-mail válido estiver disponível
  useEffect(() => {
    // Para usuários logados, cria imediatamente.
    // Para convidados, espera o preenchimento do e-mail.
    if (getPayerEmail()) {
        createPreference();
    } else {
        // Se o usuário deslogar ou o email ficar inválido, limpa a preferência
        setPreferenceId(null);
        setIsLoading(false);
    }
  }, [createPreference, guestEmail, user, isAuthenticated]);

  // Efeito para inicializar o Brick do Mercado Pago
  useEffect(() => {
    if (preferenceId) {
      const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
      if (!mpPublicKey) {
        console.error("Chave pública do Mercado Pago não encontrada. Verifique o arquivo .env");
        setError("Erro de configuração: a chave pública do Mercado Pago não foi definida.");
        return;
      }

      const mp = new window.MercadoPago(mpPublicKey, { locale: 'pt-BR' });
      const bricksBuilder = mp.bricks();

      const renderPaymentBrick = async () => {
        const containerId = "paymentBrick_container";
        const container = document.getElementById(containerId);
        if (container?.firstChild) {
            // Limpa o container para evitar renderizações duplicadas
            container.innerHTML = "";
        }

        await bricksBuilder.create('payment', containerId, {
          initialization: {
            amount: packageToPurchase.price,
            preferenceId: preferenceId,
          },
          customization: {
            visual: {
              style: { theme: 'dark' },
            },
            paymentMethods: {
              ticket: 'all',
              bankTransfer: ['pix'],
              creditCard: 'all',
              debitCard: 'all',
              mercadoPago: 'all',
            },
          },
          callbacks: {
            onReady: () => {},
            onSubmit: () => {
              // A promise é resolvida sem valor para indicar o início do fluxo.
              // O resultado final será notificado via webhook.
              onPaymentSuccess();
              return new Promise<void>((resolve) => resolve());
            },
            onError: (error) => {
              console.error('Erro no Brick de Pagamento:', error);
            },
          },
        });
      };

      renderPaymentBrick();
    }
  }, [preferenceId, packageToPurchase]);

  const renderGuestEmailInput = () => (
    <div className="p-6 sm:p-8 space-y-4">
        <label htmlFor="guest-email" className="block text-lg font-semibold text-sky-400 text-center">
            Digite seu e-mail para continuar
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
    const payerEmail = getPayerEmail();

    if (!isAuthenticated && !payerEmail) {
        return renderGuestEmailInput();
    }

    if (isLoading) {
      return <div className="text-center text-slate-300 p-8">Carregando gateway de pagamento...</div>;
    }

    if (error) {
      return <div className="text-center text-red-400 p-8">{error}</div>;
    }

    // O container do Brick é renderizado aqui
    return <div id="paymentBrick_container" className="p-6 sm:p-8"></div>;
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
                  <TicketIcon className="w-5 h-5 mr-1.5"/> Desconto KAIROS: -{packageToPurchase.discountApplied.percentage}%
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