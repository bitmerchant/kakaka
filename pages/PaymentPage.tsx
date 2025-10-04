import React, { useState, useEffect, useCallback } from 'react';
import { PackageForPaymentDisplay } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, TicketIcon } from '../components/Icons';

// --- INSTRUÇÃO ---
// Para que o frontend funcione, crie um arquivo .env na raiz do projeto
// e adicione sua Public Key do Mercado Pago, como no exemplo abaixo:
// VITE_MP_PUBLIC_KEY=SUA_PUBLIC_KEY_AQUI

// Tipagem para o objeto MercadoPago que é carregado no window
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
  const { user, isAuthenticated, showAuthModal } = useAuth();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accentColorName = packageToPurchase.accentColor.split('-')[1] || 'sky';

  // Função para criar a preferência de pagamento
  const createPreference = useCallback(async () => {
    if (!isAuthenticated || !user?.email) {
      showAuthModal('login');
      setIsLoading(false);
      setError("Você precisa estar logado para continuar.");
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/criar-preferencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produto: packageToPurchase.title,
          // A API espera um número, então garantimos que 'price' seja numérico
          valor: Number(packageToPurchase.price),
          email: user.email,
          origin: window.location.origin,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar a preferência de pagamento.');
      }

      const data = await response.json();
      setPreferenceId(data.preferenceId);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [packageToPurchase, user, isAuthenticated, showAuthModal]);

  // Efeito para criar a preferência quando o componente é montado
  useEffect(() => {
    createPreference();
  }, [createPreference]);

  // Efeito para inicializar o Brick do Mercado Pago quando a preferenceId estiver pronta
  useEffect(() => {
    if (preferenceId) {
      const mpPublicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
      if (!mpPublicKey) {
        console.error("Chave pública do Mercado Pago não encontrada. Verifique o arquivo .env");
        setError("Erro de configuração: a chave pública do Mercado Pago não foi definida.");
        return;
      }

      const mp = new window.MercadoPago(mpPublicKey, {
        locale: 'pt-BR'
      });
      const bricksBuilder = mp.bricks();

      const renderPaymentBrick = async () => {
        // Limpa o container caso já exista um Brick renderizado
        const container = document.getElementById("paymentBrick_container");
        if (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        await bricksBuilder.create('payment', 'paymentBrick_container', {
          initialization: {
            amount: Number(packageToPurchase.price),
            preferenceId: preferenceId,
          },
          customization: {
            visual: {
              style: {
                theme: 'dark', // ou 'default', 'bootstrap'
                customVariables: {
                  formBackgroundColor: '#1e293b', // slate-800
                  baseColor: '#64748b', // slate-500
                  textColor: '#e2e8f0', // slate-200
                  inputBackgroundColor: '#0f172a', // slate-900
                  // Cor do botão de pagamento, usando a cor do pacote
                  buttonBackgroundColor: `#${packageToPurchase.accentColor.split('-')[1] === 'sky' ? '0ea5e9' : 'f59e0b'}`,
                }
              }
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
            onReady: () => {
              /*
                Callback chamado quando o Brick estiver pronto.
              */
            },
            onSubmit: ({ selectedPaymentMethod, formData }) => {
              // Callback chamado ao clicar no botão de pagar
              // A promise é resolvida sem valor, apenas para indicar que o fluxo de pagamento foi iniciado.
              // O resultado final do pagamento será notificado via webhook.
              console.log('Pagamento enviado:', { selectedPaymentMethod, formData });
              return new Promise<void>((resolve) => {
                  // O onPaymentSuccess pode ser chamado aqui para dar um feedback inicial ao usuário,
                  // ou aguardar a confirmação do webhook para uma confirmação final.
                  // Por simplicidade, vamos chamar aqui para fechar o modal.
                  onPaymentSuccess();
                  resolve();
              });
            },
            onError: (error) => {
              // Callback chamado para erros de preenchimento de formulário
              console.error('Erro no Brick de Pagamento:', error);
            },
          },
        });
      };

      renderPaymentBrick();
    }
  }, [preferenceId, packageToPurchase]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-slate-300 p-8">Carregando gateway de pagamento...</div>;
    }

    if (error) {
      return <div className="text-center text-red-400 p-8">{error}</div>;
    }

    if (preferenceId) {
      // O container do Brick será renderizado aqui
      return <div id="paymentBrick_container" className="p-6 sm:p-8"></div>;
    }

    return null;
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