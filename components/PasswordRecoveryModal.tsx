
import React, { useState, useEffect } from 'react';
import { BoltIcon, AtSymbolIcon, ShieldCheckIcon, LockClosedIcon, KeyIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext will provide recovery functions

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: 'request' | 'reset';
  setCurrentStep: (step: 'request' | 'reset') => void;
  nicknameToRecover: string | null;
  setNicknameToRecover: (nickname: string | null) => void;
}

const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({ 
    isOpen, onClose, currentStep, setCurrentStep, nicknameToRecover, setNicknameToRecover 
}) => {
  const [nicknameInput, setNicknameInput] = useState('');
  const [securityCodeInput, setSecurityCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulated backend functions (replace with actual API calls)
  const verifyNicknameAndSecurityCode = async (nickname: string, code: string): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const storedUsers = JSON.parse(localStorage.getItem('kairosRegisteredUsers') || '[]');
        const userFound = storedUsers.find((u: any) => u.nickname === nickname && u.securityCode === code);
        if (userFound) {
          setNicknameToRecover(nickname); // Store for password reset step
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  };

  const resetUserPassword = async (nickname: string, newPass: string): Promise<boolean> => {
     return new Promise(resolve => {
      setTimeout(() => {
        const storedUsers = JSON.parse(localStorage.getItem('kairosRegisteredUsers') || '[]');
        const userIndex = storedUsers.findIndex((u: any) => u.nickname === nickname);
        if (userIndex !== -1) {
          storedUsers[userIndex].password = newPass; // WARNING: Plaintext password, for demo only!
          localStorage.setItem('kairosRegisteredUsers', JSON.stringify(storedUsers));
          // If user is currently logged in and it's their account, update session too (though unlikely path here)
          const currentUser = JSON.parse(localStorage.getItem('kairosUser') || 'null');
          if(currentUser && currentUser.nickname === nickname) {
            currentUser.password = newPass;
            localStorage.setItem('kairosUser', JSON.stringify(currentUser));
          }
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  };


  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMessage('');
      setNicknameInput(nicknameToRecover || ''); // Pre-fill if already set
      setSecurityCodeInput('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      // Reset internal state when modal is closed externally
      setCurrentStep('request');
      setNicknameToRecover(null);
    }
  }, [isOpen, nicknameToRecover, setCurrentStep, setNicknameToRecover]);


  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!nicknameInput || !securityCodeInput) {
      setError("Nickname e Código de Segurança são obrigatórios.");
      return;
    }
    if (!/^[0-9]{4}$/.test(securityCodeInput)) {
      setError("Código de Segurança deve ter 4 dígitos numéricos.");
      return;
    }
    setLoading(true);
    const isValid = await verifyNicknameAndSecurityCode(nicknameInput, securityCodeInput);
    if (isValid) {
      setSuccessMessage("Informações verificadas. Prossiga para criar uma nova senha.");
      setCurrentStep('reset');
    } else {
      setError("Nickname ou Código de Segurança inválido.");
    }
    setLoading(false);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!newPassword || !confirmNewPassword) {
      setError("Nova senha e confirmação são obrigatórias.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("As novas senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (!nicknameToRecover) {
        setError("Erro: Nickname para recuperação não encontrado. Tente novamente desde o início.");
        setCurrentStep('request');
        return;
    }
    setLoading(true);
    const success = await resetUserPassword(nicknameToRecover, newPassword);
    if (success) {
      setSuccessMessage("Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.");
      setTimeout(() => {
        onClose(); // Close modal after success
        // Optionally redirect to login or show AuthModal for login
      }, 3000);
    } else {
      setError("Falha ao redefinir a senha. Tente novamente.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;
  
  const commonInputClass = "w-full px-4 py-3 rounded-md bg-slate-700 border border-slate-600 text-slate-200 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-colors";
  const commonLabelClass = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
      role="dialog" aria-modal="true" aria-labelledby="recovery-modal-title"
    >
      <div 
        className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border-2 border-fuchsia-500/50 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Fechar modal de recuperação"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex justify-center mb-6">
          <KeyIcon className="h-12 w-12 text-fuchsia-400" />
        </div>
        <h2 id="recovery-modal-title" className="text-2xl sm:text-3xl font-bold text-center text-fuchsia-400 mb-4">
          Recuperar Senha
        </h2>

        {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md mb-4 text-center">{error}</p>}
        {successMessage && <p className="bg-green-500/20 text-green-400 text-sm p-3 rounded-md mb-4 text-center">{successMessage}</p>}

        {currentStep === 'request' && (
          <form onSubmit={handleRequestSubmit} className="space-y-5">
            <p className="text-center text-slate-400 text-sm mb-6">
              Insira seu nickname e código de segurança para iniciar a recuperação.
            </p>
            <div>
              <label htmlFor="rec-nickname" className={commonLabelClass}>Nickname</label>
              <div className="relative">
                <AtSymbolIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input type="text" id="rec-nickname" value={nicknameInput} onChange={(e) => setNicknameInput(e.target.value)} className={`${commonInputClass} pl-10`} placeholder="SeuNickname" required />
              </div>
            </div>
            <div>
              <label htmlFor="rec-security-code" className={commonLabelClass}>Código de Segurança (4 dígitos)</label>
              <div className="relative">
                <ShieldCheckIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input 
                    type="text" 
                    id="rec-security-code" 
                    value={securityCodeInput} 
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 4) setSecurityCodeInput(val);
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
            <button type="submit" disabled={loading} className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center">
              {loading ? 'Verificando...' : 'Verificar Dados'}
            </button>
          </form>
        )}

        {currentStep === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-5">
             <p className="text-center text-slate-400 text-sm mb-6">
              Código de segurança verificado para <strong className="text-fuchsia-400">{nicknameToRecover}</strong>. Crie sua nova senha.
            </p>
            <div>
              <label htmlFor="rec-new-password" className={commonLabelClass}>Nova Senha (mínimo 6 caracteres)</label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input type="password" id="rec-new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${commonInputClass} pl-10`} placeholder="••••••••" required />
              </div>
            </div>
            <div>
              <label htmlFor="rec-confirm-new-password" className={commonLabelClass}>Confirmar Nova Senha</label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2"/>
                <input type="password" id="rec-confirm-new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={`${commonInputClass} pl-10`} placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center">
              {loading ? 'Salvando...' : 'Redefinir Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordRecoveryModal;
