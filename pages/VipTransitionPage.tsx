// pages/VipTransitionPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ViewState } from '../types';
import { CheckIcon, LockClosedIcon, KeyIcon, ArrowPathIcon, SparklesIcon } from '../components/Icons';

type PageStep = 'connecting' | 'password_prompt' | 'authenticating' | 'generating' | 'success' | 'error' | 'locked';

interface VipTransitionPageProps {
  onNavigate: (view: ViewState) => void;
}

const VipTransitionPage: React.FC<VipTransitionPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<PageStep>('connecting');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (step === 'connecting') {
      timerRef.current = window.setTimeout(() => setStep('password_prompt'), 2500);
    } else if (step === 'authenticating') {
      timerRef.current = window.setTimeout(() => {
        // @ts-ignore - securityCode is on user object for this app
        if (password === user?.securityCode) {
          setError('');
          setAttempts(0);
          setStep('generating');
        } else {
          setError('Código de segurança incorreto. Verifique e tente novamente.');
          setAttempts(prev => prev + 1);
          setStep('error');
        }
      }, 2000);
    } else if (step === 'generating') {
        timerRef.current = window.setTimeout(() => setStep('success'), 3000);
    } else if (step === 'error') {
        if (attempts >= 3) {
            setStep('locked');
            setLockoutTime(30);
        } else {
            timerRef.current = window.setTimeout(() => setStep('password_prompt'), 2500);
        }
    } else if (step === 'locked') {
        if (lockoutTime > 0) {
            timerRef.current = window.setTimeout(() => setLockoutTime(prev => prev - 1), 1000);
        } else {
            setStep('password_prompt');
            setAttempts(0);
            setError('');
        }
    }
  }, [step, password, user, attempts, lockoutTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length !== 4 || !/^\d{4}$/.test(password)) {
        setError('O código de segurança deve conter exatamente 4 dígitos numéricos.');
        return;
    }
    setError('');
    setStep('authenticating');
  };

  const renderStatusDisplay = (text: string) => (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
        <ArrowPathIcon className="w-12 h-12 text-sky-400 animate-spin mb-6" />
        <p className="text-xl font-semibold text-sky-300 tracking-wider">{text}</p>
        <p className="text-sm text-slate-400 mt-2">Estabelecendo conexão segura com a rede KAIROS...</p>
    </div>
  );

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-purple-900 to-sky-900/80 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-sky-500/30 overflow-hidden transition-all duration-500">
            <div className="p-6 sm:p-8">
                {step !== 'connecting' && (
                    <div className="mb-6 border border-slate-700 bg-slate-900/50 rounded-lg p-4 text-sm font-mono shadow-inner">
                        <p className="flex items-center"><span className="text-green-400 mr-2 text-lg">📡</span> <span className="text-slate-400 mr-2">Servidor:</span> <span className="text-white">kairos.vip.net:443</span></p>
                        <p className="flex items-center mt-2"><span className="text-purple-400 mr-2 text-lg">🧠</span> <span className="text-slate-400 mr-2">Apelido:</span> <span className="text-white">{user?.nickname || 'bitmerchant'}</span></p>
                    </div>
                )}

                {step === 'connecting' && renderStatusDisplay('Conectando...')}

                {(step === 'password_prompt' || step === 'error') && (
                    <div className="w-full">
                        <p className="text-sm text-slate-300 text-center mb-6">Insira seu código de segurança de 4 dígitos criado na tela de registro do site para gerar a CKEY de acesso.</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <KeyIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 4) setPassword(val);
                                    }}
                                    maxLength={4}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-md text-white text-center text-xl tracking-[0.5em] focus:border-amber-400 focus:ring-amber-400 outline-none transition-colors"
                                    placeholder="••••"
                                    autoFocus
                                    required
                                />
                            </div>
                            {error && <p className="text-red-400 text-center text-sm pt-2">{error}</p>}
                            <button
                                type="submit"
                                className="w-full px-5 py-3 bg-amber-500 text-white font-bold rounded-md border-2 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] hover:bg-amber-600 transition-all transform hover:scale-105 flex items-center justify-center"
                            >
                                <LockClosedIcon className="w-5 h-5 mr-2" />
                                AUTENTICAR E GERAR CKEY
                            </button>
                        </form>
                    </div>
                )}

                {step === 'authenticating' && renderStatusDisplay('Autenticando CKEY...')}
                {step === 'generating' && renderStatusDisplay('Gerando chave de sessão...')}

                {step === 'success' && (
                    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[220px] bg-green-900/30 border-2 border-green-500 rounded-lg">
                        <CheckIcon className="w-12 h-12 text-green-400 mb-6" />
                        <p className="text-xl font-semibold text-green-300 tracking-wider">CKEY GERADA COM SUCESSO</p>
                        <p className="text-sm text-slate-300 mt-2">Sua sessão VIP está autenticada e pronta para conexão.</p>
                        <button
                            onClick={() => onNavigate('vipChat')}
                            className="w-full mt-6 px-5 py-3 bg-sky-500 text-white font-bold rounded-md border-2 border-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.5)] hover:bg-sky-600 transition-all transform hover:scale-105 flex items-center justify-center"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            ENTRAR NO CHAT VIP KAIROS
                        </button>
                    </div>
                )}
                
                {step === 'locked' && (
                    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[220px] bg-red-900/30 border-2 border-red-500 rounded-lg">
                        <LockClosedIcon className="w-12 h-12 text-red-400 mb-6" />
                        <p className="text-xl font-semibold text-red-300 tracking-wider">PROTOCOLO DE SEGURANÇA ATIVADO</p>
                        <p className="text-sm text-slate-300 mt-2">Muitas tentativas falhas. O sistema está bloqueado.</p>
                        <p className="text-3xl font-bold text-white mt-4 font-mono">{lockoutTime}</p>
                        <p className="text-xs text-slate-400">segundos restantes</p>
                    </div>
                )}
            </div>
        </div>
    </section>
  );
};

export default VipTransitionPage;
