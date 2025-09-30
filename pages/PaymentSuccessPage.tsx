import React, { useEffect } from 'react';
import { SparklesIcon } from '../components/Icons';
import { ViewState } from '../types';

interface PaymentSuccessPageProps {
  onNavigate: (view: ViewState, params?: any) => void;
  onPaymentConfirmed: () => void;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ onNavigate, onPaymentConfirmed }) => {
  useEffect(() => {
    // When this page loads, we can assume the payment was successful
    // because the user was redirected here by the payment gateway.
    onPaymentConfirmed();
  }, [onPaymentConfirmed]);

  const handleGoToPurchases = () => {
    onNavigate('myPurchases');
  };

  return (
    <section id="payment-success" className="py-16 md:py-24 bg-slate-900 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-2xl text-center">
        <div className="bg-slate-800 shadow-2xl rounded-xl p-8 border-2 border-green-500/70">
          <div className="flex justify-center mb-4">
            <SparklesIcon className="w-16 h-16 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-green-400 mb-4">Pagamento Confirmado!</h2>
          <p className="text-slate-300 text-lg mb-6">
            Seu acesso VIP foi ativado com sucesso! Explore agora todos os benefícios exclusivos que preparamos para você.
          </p>
          <button
            onClick={handleGoToPurchases}
            className="px-8 py-3 text-lg font-semibold rounded-md transition-all duration-150 shadow-lg bg-green-600 text-white hover:bg-green-500 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-400"
          >
            Ver Minhas Compras
          </button>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccessPage;