import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BoltIcon, UserCircleIcon, LockClosedIcon as LockIcon, EnvelopeIcon, UserPlusIcon, KeyIcon, ShieldCheckIcon, AtSymbolIcon, ArrowPathIcon, CheckIcon } from './Icons'; // Added ArrowPathIcon

// Helper function to validate nickname (alphanumeric, no spaces)
const isValidNickname = (nickname: string): boolean => {
  const nicknameRegex = /^[a-zA-Z0-9]+$/;
  return nicknameRegex.test(nickname) && nickname.length >= 3 && nickname.length <= 20;
};

// Helper function to validate security code (4 digits)
const isValidSecurityCode = (code: string): boolean => {
  const codeRegex = /^[0-9]{4}$/;
  return codeRegex.test(code);
};

type AuthProgressState = 'idle' | 'verifying_user' | 'checking_nickname_availability' | 'validating_credentials' | 'processing_registration' | 'success' | 'error_local' | 'error_api';
const AUTH_STEP_DELAY_MS = 2500; // 2.5 seconds between steps
const ACTION_SUCCESS_DISPLAY_MS = 2500; // 2.5 seconds for success message before hide


const AuthModal: React.FC = () => {
  const { isAuthModalOpen, hideAuthModal, login, register, authModalView, showPasswordRecoveryModal } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'register'>(authModalView);

  const [nickname, setNickname] = useState(''); 
  const [loginNickname, setLoginNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  
  const [authProgress, setAuthProgress] = useState<AuthProgressState>('idle');
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Store timeout IDs to clear them if modal closes or form resubmits
  const [currentTimeoutId, setCurrentTimeoutId] = useState<number | null>(null);

  useEffect(() => {
    // Clear any running timeouts when modal visibility or view changes
    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId);
      setCurrentTimeoutId(null);
    }
    
    setCurrentView(authModalView); 
    setErrorMessage(''); 
    setProgressMessage('');
    setAuthProgress('idle');
    setNickname('');
    setLoginNickname('');
    setPassword('');
    setConfirmPassword('');
    setSecurityCode('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authModalView, isAuthModalOpen]);

   // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
      }
    };
  }, [currentTimeoutId]);


  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTimeoutId) clearTimeout(currentTimeoutId);
    setErrorMessage('');
    setProgressMessage('');

    if (!loginNickname || !password) {
      setErrorMessage("Nickname e senha são obrigatórios.");
      setAuthProgress('error_local');
      return;
    }
    
    setAuthProgress('verifying_user');
    setProgressMessage("Verificando usuário...");

    const timeout1 = window.setTimeout(async () => {
        setAuthProgress('validating_credentials');
        setProgressMessage("Usuário validado com sucesso."); // Updated message
        const response = await login(loginNickname, password);
        if (response.success) {
            setAuthProgress('success');
            // Login success message is handled by AuthContext notification if needed
            // Modal closes directly after ACTION_SUCCESS_DISPLAY_MS
            const timeout2 = window.setTimeout(() => {
              hideAuthModal(); 
            }, ACTION_SUCCESS_DISPLAY_MS); 
            setCurrentTimeoutId(timeout2);
        } else {
            setErrorMessage(response.error || "Falha no login.");
            setAuthProgress('error_api');
            // Reset progress message for clarity on error
            setProgressMessage("Falha na validação.");
        }
    }, AUTH_STEP_DELAY_MS);
    setCurrentTimeoutId(timeout1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTimeoutId) clearTimeout(currentTimeoutId);
    setErrorMessage('');
    setProgressMessage('');

    if (!nickname || !password || !confirmPassword || !securityCode) {
      setErrorMessage("Nickname, Código de Segurança e Senha são obrigatórios."); 
      setAuthProgress('error_local'); return;
    }
    if (!isValidNickname(nickname)) {
      setErrorMessage('Nickname inválido. Use 3-20 caracteres alfanuméricos, sem espaços.'); 
      setAuthProgress('error_local'); return;
    }
    if (!isValidSecurityCode(securityCode)) {
      setErrorMessage('Código de segurança inválido. Deve conter 4 dígitos numéricos.'); 
      setAuthProgress('error_local'); return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem."); 
      setAuthProgress('error_local'); return;
    }
    if (password.length < 6) {
        setErrorMessage("A senha deve ter pelo menos 6 caracteres."); 
        setAuthProgress('error_local'); return;
    }
    
    setAuthProgress('verifying_user');
    setProgressMessage("Verificando usuário...");

    const timeout1 = window.setTimeout(() => {
        setAuthProgress('checking_nickname_availability');
        setProgressMessage("Confirmando disponibilidade...");
        const timeout2 = window.setTimeout(async () => {
            setAuthProgress('processing_registration');
            setProgressMessage("Usuário aceito. Registrando...");
            
            // Retrieve guest spin data from session storage
            const guestInitialSpinsRaw = sessionStorage.getItem('kairosGuestDiceSpins');
            const guestSpinsUsedRaw = sessionStorage.getItem('kairosGuestDiceSpinsUsed');
            const guestInitialSpins = guestInitialSpinsRaw ? parseInt(guestInitialSpinsRaw, 10) : 0;
            const guestSpinsUsed = guestSpinsUsedRaw ? parseInt(guestSpinsUsedRaw, 10) : 0;

            const response = await register({ nickname, securityCode, password }, guestInitialSpins, guestSpinsUsed);
            
            if (response.success) {
                setAuthProgress('success');
                setProgressMessage("Registrado com sucesso!");
                 // Clear session storage items after successful registration
                sessionStorage.removeItem('kairosGuestDiceSpins');
                sessionStorage.removeItem('kairosGuestDiceSpinsUsed');
                sessionStorage.removeItem('kairosGuestRouletteSpun_v1');
                sessionStorage.removeItem('kairosGuestLostSpin_v1');
                
                const timeout3 = window.setTimeout(() => {
                    hideAuthModal();
                }, ACTION_SUCCESS_DISPLAY_MS); 
                setCurrentTimeoutId(timeout3);
            } else {
                setErrorMessage(response.error || "Falha no registro.");
                setAuthProgress('error_api');
                setProgressMessage("Falha no registro.");
            }
        }, AUTH_STEP_DELAY_MS);
        setCurrentTimeoutId(timeout2);
    }, AUTH_STEP_DELAY_MS);
    setCurrentTimeoutId(timeout1);
  };
  
  const commonInputClass = "w-full px-4 py-3 rounded-md bg-slate-700 border border-slate-600 text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors";
  const commonLabelClass = "block text-sm font-medium text-slate-300 mb-1";
  const isLoading = ['verifying_user', 'checking_nickname_availability', 'validating_credentials', 'processing_registration'].includes(authProgress);
  const isSuccessState = authProgress === 'success';


  const renderProgressArea = () => {
    // Only show progress area if loading, in success, or if there's an error message
    if (isLoading || isSuccessState || errorMessage) {
      return (
        <div className="mt-4 p-3 rounded-md text-center text-sm min-h-[60px] flex flex-col justify-center items-center">
          {(isLoading || isSuccessState) && progressMessage && (
            <div className={`flex items-center ${isSuccessState ? 'text-green-400' : 'text-sky-300'}`}>
              {isLoading && <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin"/>}
              {isSuccessState && <CheckIcon className="w-5 h-5 mr-2"/>}
              <span>{progressMessage}</span>
            </div>
          )}
          {errorMessage && (authProgress === 'error_local' || authProgress === 'error_api') && (
             <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md w-full">{errorMessage}</p>
          )}
        </div>
      );
    }
    return null;
  }


  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={(isLoading || isSuccessState) ? undefined : hideAuthModal} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border-2 border-sky-500/50 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {!(isLoading || isSuccessState) && (
            <button 
            onClick={hideAuthModal} 
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Fechar modal"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        )}

        <div className="flex justify-center mb-6">
          <BoltIcon className="h-12 w-12 text-sky-400" />
        </div>
        <h2 id="auth-modal-title" className="text-2xl sm:text-3xl font-bold text-center text-sky-400 mb-2">
          {currentView === 'login' ? 'Acessar KAIROS Hub' : 'Criar Conta KAIROS'}
        </h2>
        <p className="text-center text-slate-400 mb-6 text-sm">
          {currentView === 'login' ? 'Bem-vindo de volta, Mestre KAIROS!' : 'Junte-se à elite e desbloqueie o poder.'}
        </p>

        {!(isLoading || isSuccessState) && (
          <div className="flex border-b border-slate-700 mb-6">
            <button 
              onClick={() => { setCurrentView('login'); setAuthProgress('idle'); setErrorMessage(''); if (currentTimeoutId) clearTimeout(currentTimeoutId); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${currentView === 'login' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-sky-300'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setCurrentView('register'); setAuthProgress('idle'); setErrorMessage(''); if (currentTimeoutId) clearTimeout(currentTimeoutId); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${currentView === 'register' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-sky-300'}`}
            >
              Cadastro
            </button>
          </div>
        )}
        
        {renderProgressArea()}

        {!(isLoading || isSuccessState) && currentView === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="login-nickname" className={commonLabelClass}>Nickname</label>
              <div className="relative">
                <AtSymbolIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input type="text" id="login-nickname" value={loginNickname} onChange={(e) => setLoginNickname(e.target.value)} className={`${commonInputClass} pl-10`} placeholder="SeuNickname" required />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className={commonLabelClass}>Senha</label>
               <div className="relative">
                <LockIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${commonInputClass} pl-10`} placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center">
              Entrar
            </button>
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => { if (currentTimeoutId) clearTimeout(currentTimeoutId); showPasswordRecoveryModal(); }}
                className="text-sm text-sky-400 hover:text-sky-300 hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        )}
        
        {!(isLoading || isSuccessState) && currentView === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label htmlFor="reg-nickname" className={commonLabelClass}>Nickname* <span className="text-xs text-slate-500">(letras e números, sem espaços, 3-20 caracteres)</span></label>
              <div className="relative">
                <AtSymbolIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input type="text" id="reg-nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className={`${commonInputClass} pl-10`} placeholder="Seu Apelido Único" required />
              </div>
            </div>
             <div>
              <label htmlFor="reg-security-code" className={commonLabelClass}>Código de Segurança* <span className="text-xs text-slate-500">(4 dígitos numéricos para recuperação)</span></label>
              <div className="relative">
                <ShieldCheckIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input 
                  type="text" 
                  id="reg-security-code" 
                  value={securityCode} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); 
                    if (val.length <= 4) setSecurityCode(val);
                  }}
                  className={`${commonInputClass} pl-10`} 
                  placeholder="Ex: 1234" 
                  maxLength={4} 
                  minLength={4}
                  pattern="\d{4}"
                  required 
                />
              </div>
            </div>
            <div>
              <label htmlFor="reg-password" className={commonLabelClass}>Senha* <span className="text-xs text-slate-500">(mínimo 6 caracteres)</span></label>
              <div className="relative">
                <LockIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input type="password" id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${commonInputClass} pl-10`} placeholder="Crie uma senha forte" required />
              </div>
            </div>
            <div>
              <label htmlFor="reg-confirm-password" className={commonLabelClass}>Confirmar Senha*</label>
              <div className="relative">
                <LockIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input type="password" id="reg-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${commonInputClass} pl-10`} placeholder="Repita sua senha" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center">
               Criar Conta <UserPlusIcon className="w-5 h-5 ml-2" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
