import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePurchases } from '../contexts/PurchaseContext';
import { UserCircleIcon, ShoppingBagIcon, ArrowRightOnRectangleIcon, SparklesIcon, CheckIcon, VipBadgeIcon, KeyIcon, CopyIcon, ArrowUpRightIcon, GiftIcon, TrendingUpIcon, ShieldCheckIcon, TicketIcon, CalendarDaysIcon, ArrowLeftIcon, PhotoIcon, CogIcon, LockClosedIcon, AtSymbolIcon, BoltIcon, CodeBracketIcon, ChevronDownIcon, ChevronUpIcon, CrownIcon, ChatBubbleLeftRightIcon } from './Icons'; 
import { AVAILABLE_PROFILE_AVATARS, ProfileAvatarId, KairosMasteryLevel, ViewState, AwardedDiscount, KAIROS_PACKAGE_ID, User, ThemeSettings, NotificationPrefs, VipHistoryItem } from '../types';
import { KairosAvatarDefault, KairosAvatarCoupon, KairosAvatarRoulette, KairosAvatarTrophy, KairosAvatarStore, KairosAvatarGift } from './Icons';
import RGBBorderWrapper from './RGBBorderWrapper';
import { KAIROS_PACKAGE_DESCRIPTION, THEME_COLORS } from '../constants';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState, params?: any) => void;
  onInitiatePurchase: () => void; 
}

const AVATAR_COMPONENTS_MAP: Record<ProfileAvatarId, React.FC<{className?: string}>> = {
  kairosAvatarDefault: KairosAvatarDefault,
  kairosAvatarCoupon: KairosAvatarCoupon,
  kairosAvatarRoulette: KairosAvatarRoulette,
  kairosAvatarTrophy: KairosAvatarTrophy,
  kairosAvatarStore: KairosAvatarStore,
  kairosAvatarGift: KairosAvatarGift,
};

type ActiveTab = 'meuPerfil' | 'vip' | 'cupons' | 'compras' | 'configuracoes';

// Helper to format date for history
const formatHistoryDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MeuPerfilTab: React.FC<{ user: User }> = ({ user }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
    <div>
      <h4 className="text-sm font-semibold text-slate-400 mb-1">Nickname</h4>
      <p className="text-lg text-white flex items-center gap-2"><AtSymbolIcon className="w-4 h-4 text-slate-400" />{user.nickname}</p>
    </div>
    <div>
      <h4 className="text-sm font-semibold text-slate-400 mb-1">Membro Desde</h4>
      <p className="text-white flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4 text-slate-400" /> {new Date(user.registrationDate).toLocaleDateString('pt-BR')}</p>
    </div>
    <div>
      <h4 className="text-sm font-semibold text-slate-400 mb-1">Nível de Maestria</h4>
      <p className="text-white flex items-center gap-2"><SparklesIcon className="w-4 h-4 text-amber-400" /> {user.kairosMasteryLevel || 'Novato KAIROS'}</p>
    </div>
    <div>
      <h4 className="text-sm font-semibold text-slate-400 mb-1">Status VIP</h4>
      <p className={`font-bold flex items-center gap-2 ${user.isVip ? 'text-green-400' : 'text-slate-400'}`}>
        <VipBadgeIcon className="w-4 h-4" /> {user.isVip ? 'Ativo' : 'Inativo'}
      </p>
    </div>
  </div>
);

const CuponsTab: React.FC<{ coupons: AwardedDiscount[], onRedeem: (coupon: AwardedDiscount) => void }> = ({ coupons, onRedeem }) => {
  const activeCoupons = coupons.filter(c => !c.claimed && c.expiry > Date.now());
  const expiredOrClaimedCoupons = coupons.filter(c => c.claimed || c.expiry <= Date.now());

  return (
    <div>
      <h3 className="text-lg font-semibold text-sky-300 mb-4">Cupons Ativos</h3>
      {activeCoupons.length > 0 ? (
        <div className="space-y-3">
          {activeCoupons.map(coupon => (
            <div key={coupon.id} className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between gap-3">
              <div className="flex-grow">
                <p className="font-bold text-green-400 flex items-center"><TicketIcon className="w-4 h-4 mr-2"/>{coupon.percentage}% OFF</p>
                <p className="text-xs text-slate-400">Código: <span className="font-mono">{coupon.code}</span></p>
                <p className="text-xs text-slate-500">Expira em: {new Date(coupon.expiry).toLocaleString('pt-BR')}</p>
              </div>
              <button onClick={() => onRedeem(coupon)} className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors flex-shrink-0">
                Usar Agora
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center py-4">Você não possui cupons ativos. Tente a sorte na Roleta KAIROS!</p>
      )}

      {expiredOrClaimedCoupons.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-slate-500 mt-6 mb-4">Cupons Expirados ou Usados</h3>
          <div className="space-y-3 opacity-60">
            {expiredOrClaimedCoupons.map(coupon => (
              <div key={coupon.id} className="bg-slate-700/50 p-3 rounded-lg">
                <p className="font-bold text-slate-400 flex items-center"><TicketIcon className="w-4 h-4 mr-2"/>{coupon.percentage}% OFF</p>
                <p className="text-xs text-slate-500">Código: {coupon.code}</p>
                <p className="text-xs text-red-500 font-semibold">{coupon.claimed ? 'Utilizado' : 'Expirado'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface ComprasTabProps {
  hasPackage: boolean;
  purchaseDate: number | null;
  onNavigate: (view: ViewState, params?: any) => void;
  onClose: () => void;
}

const ComprasTab: React.FC<ComprasTabProps> = ({ hasPackage, purchaseDate, onNavigate, onClose }) => {
  if (!hasPackage) {
    return (
      <div className="text-center p-4">
        <p className="text-slate-400 mb-4">Você ainda não adquiriu o Pacote KAIROS ULTIMATE.</p>
        <button
          onClick={() => {
            onClose();
            onNavigate('main', { scrollTo: 'prompts' });
          }}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-md transition-colors"
        >
          Ver Pacote
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-sky-300 mb-4">Minhas Compras</h3>
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h4 className="font-bold text-amber-400">{KAIROS_PACKAGE_DESCRIPTION.title}</h4>
        <p className="text-xs text-slate-400">Adquirido em: {purchaseDate ? new Date(purchaseDate).toLocaleString('pt-BR') : 'Data indisponível'}</p>
        <button
          onClick={() => {
            onClose();
            onNavigate('myPurchases');
          }}
          className="mt-3 text-sm text-sky-400 hover:underline flex items-center"
        >
          Acessar Prompts e Guia <ArrowUpRightIcon className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

const VipTab: React.FC<{ user: User; updateUserSettings: (settings: { themeSettings?: Partial<ThemeSettings> }) => void; }> = ({ user, updateUserSettings }) => {
    // FIX: Explicitly type the useState hook with ThemeSettings to prevent type widening of animationSpeed from 'normal' to 'string'.
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(user.themeSettings || { accentColor: THEME_COLORS[0].value, animationSpeed: 'normal', hoverEffect: 'glow' });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        setThemeSettings(user.themeSettings || { accentColor: THEME_COLORS[0].value, animationSpeed: 'normal', hoverEffect: 'glow' });
    }, [user.themeSettings]);

    const handleSettingChange = (setting: keyof ThemeSettings, value: any) => {
        setThemeSettings(prev => ({ ...prev, [setting]: value }));
        setSaveStatus('idle');
    };

    const handleSaveChanges = () => {
        setSaveStatus('saving');
        updateUserSettings({ themeSettings });
        setTimeout(() => setSaveStatus('saved'), 1000);
        setTimeout(() => setSaveStatus('idle'), 3000);
    };

    const benefits = [
        { title: "Roletas Extras", description: `Receba 2 giros extras na Roleta KAIROS toda semana. (${user.vipExtraSpinsAvailable || 0} disponíveis)`, icon: TicketIcon, color: "text-amber-400" },
        { title: "Descontos Exclusivos", description: "Acesso a promoções e descontos especiais em futuros pacotes.", icon: GiftIcon, color: "text-green-400" },
        { title: "Destaque Visual", description: "Seu nickname e avatar brilham com a cor VIP que você escolher.", icon: SparklesIcon, color: "text-fuchsia-400" },
        { title: "Acesso Antecipado", description: "Desbloqueie novas conquistas e badges VIP antes de todos.", icon: KeyIcon, color: "text-sky-400" },
    ];

    const vipHistory = user.vipHistory || [
        { id: '1', action: 'extra_spin_used', description: 'Usou 1 giro extra da Roleta', timestamp: Date.now() - 86400000, icon: TicketIcon },
        { id: '2', action: 'special_coupon_claimed', description: 'Ganhou cupom VIP de 25%', timestamp: Date.now() - 172800000, icon: GiftIcon },
    ];
    
    return (
        <div className="space-y-8">
            <header className="text-center">
                <h3 className="text-2xl font-bold vip-glow-text">Central VIP KAIROS</h3>
                <p className="text-sm text-slate-400">Status VIP: <span className="font-semibold text-green-400">Ativo</span></p>
            </header>
            
            <section>
                <h4 className="text-lg font-semibold text-sky-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><SparklesIcon className="w-5 h-5"/> Customização VIP</h4>
                <div className="space-y-4 rounded-lg bg-slate-700/20 p-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Cor de Destaque</label>
                        <div className="flex flex-wrap gap-3">
                            {THEME_COLORS.map(color => (
                              <button
                                key={color.name}
                                onClick={() => handleSettingChange('accentColor', color.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${themeSettings.accentColor === color.value ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : 'border-transparent'}`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                        </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Efeito Hover nos Botões</label>
                      <div className="flex flex-wrap gap-2">
                        {(['glow', 'pulse', 'subtle'] as const).map(effect => (
                          <button key={effect} onClick={() => handleSettingChange('hoverEffect', effect)}
                            className={`px-3 py-1.5 text-xs rounded-md border-2 transition-colors ${themeSettings.hoverEffect === effect ? 'bg-[--user-accent-color] text-white border-[--user-accent-color]' : 'bg-slate-700 border-slate-600 hover:border-slate-500'}`}>
                              {effect.charAt(0).toUpperCase() + effect.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                </div>
                 <button onClick={handleSaveChanges} disabled={saveStatus !== 'idle'} 
                    className={`mt-4 w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
                        saveStatus === 'saved' ? 'bg-green-600 text-white' : 
                        saveStatus === 'saving' ? 'bg-slate-600 text-slate-300 cursor-wait' : 
                        'bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50'
                    }`}
                  >
                    {saveStatus === 'saved' ? <><CheckIcon className="w-4 h-4"/> Salvo!</> : 
                     saveStatus === 'saving' ? 'Salvando...' : 'Salvar Customizações'}
                  </button>
            </section>

            <section>
                 <h4 className="text-lg font-semibold text-sky-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><CrownIcon className="w-5 h-5"/> Benefícios VIP</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {benefits.map(benefit => {
                        const BenefitIcon = benefit.icon;
                        return (
                            <div key={benefit.title} className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all transform hover:-translate-y-1">
                                <div className="flex items-center gap-3">
                                    <BenefitIcon className={`w-8 h-8 ${benefit.color} flex-shrink-0`} />
                                    <div>
                                        <p className="font-semibold text-slate-100">{benefit.title}</p>
                                        <p className="text-xs text-slate-400">{benefit.description}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </section>
            
            <section>
                <h4 className="text-lg font-semibold text-sky-300 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2"><CalendarDaysIcon className="w-5 h-5"/> Histórico VIP</h4>
                {vipHistory.length > 0 ? (
                    <ul className="space-y-2">
                        {vipHistory.map(item => {
                            const HistoryIcon = item.icon;
                            return (
                                <li key={item.id} className="flex items-center text-sm p-2 bg-slate-700/20 rounded-md">
                                    <HistoryIcon className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0"/>
                                    <span className="flex-grow text-slate-300">{item.description}</span>
                                    <span className="text-xs text-slate-500 flex-shrink-0">{formatHistoryDate(item.timestamp)}</span>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-400 text-center py-3">Nenhuma atividade VIP registrada ainda.</p>
                )}
            </section>
        </div>
    );
};


interface ConfiguracoesTabProps {
  user: User;
  updateUserProfileAvatar: (userId: string, iconId: ProfileAvatarId | null, customImageUrl: string | null) => Promise<boolean>;
}

const ConfiguracoesTab: React.FC<ConfiguracoesTabProps> = ({ user, updateUserProfileAvatar }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(user.profileIconId);
  const [avatarSaveStatus, setAvatarSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleAvatarSelect = (avatarId: ProfileAvatarId) => {
    setSelectedAvatar(avatarId);
    setAvatarSaveStatus('idle');
  };

  const handleSaveAvatar = async () => {
    setAvatarSaveStatus('saving');
    await updateUserProfileAvatar(user.id, selectedAvatar, null);
    setTimeout(() => setAvatarSaveStatus('saved'), 1000);
    setTimeout(() => setAvatarSaveStatus('idle'), 3000);
  };
  
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold text-sky-300 mb-4">Avatar do Perfil</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-4">
          {AVAILABLE_PROFILE_AVATARS.map(avatar => {
            const AvatarComponent = AVATAR_COMPONENTS_MAP[avatar.id];
            return (
              <button
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar.id)}
                className={`p-2 rounded-full transition-all duration-200 ${selectedAvatar === avatar.id ? 'bg-sky-500/50 ring-2 ring-sky-400' : 'bg-slate-700 hover:bg-slate-600'}`}
                title={avatar.tooltip}
              >
                <AvatarComponent className="w-10 h-10 text-slate-200" />
              </button>
            );
          })}
        </div>
        <button
          onClick={handleSaveAvatar}
          disabled={avatarSaveStatus !== 'idle' || selectedAvatar === user.profileIconId}
          className={`w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${
              avatarSaveStatus === 'saved' ? 'bg-green-600 text-white' : 
              avatarSaveStatus === 'saving' ? 'bg-slate-600 text-slate-300 cursor-wait' : 
              'bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50'
          }`}
        >
          {avatarSaveStatus === 'saved' ? <><CheckIcon className="w-4 h-4"/> Salvo!</> : 
           avatarSaveStatus === 'saving' ? 'Salvando...' : 'Salvar Avatar'}
        </button>
      </section>

      <section>
          <h3 className="text-lg font-semibold text-sky-300 mb-4">Gerenciamento da Conta</h3>
          <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-md bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 transition-colors">Alterar Nickname (em breve)</button>
              <button className="w-full text-left p-3 rounded-md bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 transition-colors">Alterar Senha (em breve)</button>
          </div>
      </section>

    </div>
  );
};


const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onNavigate, onInitiatePurchase }) => {
  const { user, logout, updateUserProfileAvatar, setDiscountForNextPurchase, updateUserSettings } = useAuth();
  const { hasPurchasedPackage, getPurchaseDateForUser } = usePurchases(); 
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('meuPerfil');
  
  const userHasKAIROSPackage = user ? hasPurchasedPackage(KAIROS_PACKAGE_ID) : false;
  
  useEffect(() => {
    if (isOpen) {
      setActiveTab('meuPerfil'); 
    }
  }, [isOpen]);
  
  useEffect(() => {
      const color = user?.isVip && user.themeSettings?.accentColor ? user.themeSettings.accentColor : '#0ea5e9';
      document.documentElement.style.setProperty('--user-accent-color', color);
      document.documentElement.style.setProperty('--user-accent-glow-color', color);
  }, [user]);

  if (!isOpen || !user) return null;

  const handleLogoutClick = () => {
    onClose();
    logout();
  }

  const handleRedeemCoupon = (coupon: AwardedDiscount) => {
    setDiscountForNextPurchase(coupon); 
    onClose(); 
    onInitiatePurchase(); 
  }

  let DisplayAvatarComponent: React.FC<{ className?: string }>;
  if (user.customProfileImageUrl) {
    DisplayAvatarComponent = ({ className }) => <img src={user.customProfileImageUrl!} alt={user.nickname} className={`${className} object-cover`} />;
  } else {
    DisplayAvatarComponent = AVATAR_COMPONENTS_MAP[user.profileIconId] || KairosAvatarDefault;
  }
  
  const registrationDateDisplay = new Date(user.registrationDate).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const TABS_BASE: { id: ActiveTab, label: string, icon: React.FC<{className?:string}> }[] = [
    { id: 'meuPerfil', label: 'Meu Perfil', icon: UserCircleIcon },
    { id: 'cupons', label: 'Cupons', icon: TicketIcon },
    { id: 'compras', label: 'Compras', icon: ShoppingBagIcon },
    { id: 'configuracoes', label: 'Configurações', icon: CogIcon },
  ];
  
  const TABS = user.isVip
    ? [
        TABS_BASE[0],
        { id: 'vip' as ActiveTab, label: 'VIP', icon: CrownIcon },
        ...TABS_BASE.slice(1),
      ]
    : TABS_BASE;

  
  const renderContent = () => {
    switch (activeTab) {
      case 'meuPerfil':
        return <MeuPerfilTab user={user} />;
      case 'vip':
        return <VipTab user={user} updateUserSettings={updateUserSettings} />;
      case 'cupons':
        return <CuponsTab coupons={user.awardedDiscounts} onRedeem={handleRedeemCoupon} />;
      case 'compras':
        return <ComprasTab hasPackage={userHasKAIROSPackage} purchaseDate={getPurchaseDateForUser(user.id, KAIROS_PACKAGE_ID)} onNavigate={onNavigate} onClose={onClose} />;
      case 'configuracoes':
        return <ConfiguracoesTab user={user} updateUserProfileAvatar={updateUserProfileAvatar} />;
      default:
        return null;
    }
  };


  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose} 
      role="dialog" aria-modal="true" aria-labelledby="user-profile-title"
    >
      <div
        className="bg-slate-800 w-full max-w-2xl max-h-[90vh] shadow-2xl rounded-xl border border-slate-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ '--user-accent-glow-color': user?.isVip ? 'var(--user-accent-color)' : 'transparent' } as React.CSSProperties}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 relative flex flex-col sm:flex-row items-center text-center sm:text-left border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
           <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors z-20"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
           <RGBBorderWrapper rounded="rounded-full" className="w-20 h-20 sm:w-24 sm:h-24 mr-0 sm:mr-5 mb-3 sm:mb-0 flex-shrink-0" innerPadding="p-0.5">
            <DisplayAvatarComponent className="w-full h-full text-sky-400 rounded-full" />
          </RGBBorderWrapper>
          <div className="flex-grow">
            <div className="flex items-center justify-center sm:justify-start">
              <h2 id="user-profile-title" className={`text-xl sm:text-2xl font-bold ${user.isVip ? 'vip-glow-text' : 'text-white'}`}>{user.nickname}</h2>
              {user.isVip && <span title="Usuário VIP KAIROS"><VipBadgeIcon className="w-5 h-5 ml-2 text-amber-400" /></span>}
            </div>
            <p className="text-sm text-slate-400">Membro desde {registrationDateDisplay}</p>
              {user.isVip && (
                <button
                  onClick={() => {
                    onNavigate('vipTransition');
                    onClose();
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-full shadow-lg transition-all transform hover:scale-105"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Chat VIP KAIROS
                </button>
              )}
          </div>
          <button
            onClick={handleLogoutClick}
            className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 flex items-center px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-red-500/30 hover:text-red-300 border border-slate-600 hover:border-red-500/50 rounded-md transition-colors"
            aria-label="Sair da conta"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-1.5" />
            Sair
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-[--user-accent-color] border-b-2 bg-slate-700/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-sky-300 border-b-2 border-transparent'
              } ${tab.id === 'vip' && activeTab === 'vip' ? 'vip-tab-active' : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex-grow overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;