import React, { useState, useRef, useEffect } from 'react';
import { BoltIcon, UserCircleIcon, ShoppingBagIcon, ArrowRightOnRectangleIcon, ChevronDownIcon, BellIcon, VipBadgeIcon, BookOpenIcon, CheckIcon, TicketIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { KairosAvatarDefault, KairosAvatarCoupon, KairosAvatarRoulette, KairosAvatarTrophy, KairosAvatarStore, KairosAvatarGift } from './Icons';
import { ProfileAvatarId, ViewState, NotificationItem } from '../types';


interface NavLinkProps {
  href?: string;
  onClick?: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
  isButton?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  isActive?: boolean; // To highlight active view
}

const NavLink: React.FC<NavLinkProps> = ({ href, onClick, children, isButton, ariaLabel, disabled, isActive }) => {
  const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const linkClasses = `${baseClasses} ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  const buttonClasses = `${baseClasses} bg-sky-500 text-white hover:bg-sky-600 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (onClick) {
      e.preventDefault(); 
      onClick(e);
    } else if (href && href.startsWith('#')) { 
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const navbarHeight = (document.querySelector('nav')?.offsetHeight || 64);
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  return (
    <a
      href={!disabled && href ? href : '#'} 
      onClick={handleClick}
      className={isButton ? buttonClasses : linkClasses}
      aria-label={ariaLabel || (typeof children === 'string' ? `Navegar para ${children}` : undefined)}
      aria-disabled={disabled}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </a>
  );
};

const NotificationPanel: React.FC<{
  notifications: NotificationItem[]; 
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateToLink: (view: ViewState, params?: any) => void;
}> = ({ notifications, onClose, onMarkAsRead, onMarkAllAsRead, onNavigateToLink }) => {
  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-700 z-50 max-h-[70vh] flex flex-col">
      <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-md font-semibold text-sky-400">Suas Notificações</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200" aria-label="Fechar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto flex-grow custom-scrollbar">
        {notifications.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Nenhuma notificação nova.</p>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className={`p-3 border-b border-slate-700/50 ${notification.read ? 'opacity-60' : 'bg-slate-700/30'}`}>
              <div className="flex items-start">
                {notification.icon && <notification.icon className={`w-5 h-5 mr-2.5 mt-0.5 shrink-0 ${notification.iconColor || 'text-sky-400'}`} />}
                <div>
                    <p className={`text-sm font-semibold ${notification.read ? 'text-slate-300' : 'text-sky-300'}`}>{notification.title}</p>
                    <p className="text-xs text-slate-400 mb-1">{notification.message.replace('{{promptName}}', notification.link?.params?.promptName || '').replace('{{version}}', notification.link?.params?.version || '')}</p>
                    <p className="text-xs text-slate-500">{new Date(notification.timestamp).toLocaleString('pt-BR', {dateStyle: 'short', timeStyle: 'short'})}</p>
                </div>
              </div>
              <div className="mt-2 flex justify-end space-x-2">
                {notification.link && (
                  <button
                    onClick={() => {
                      onNavigateToLink(notification.link!.view, notification.link!.params);
                      if (!notification.read) onMarkAsRead(notification.id);
                      onClose();
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 hover:underline"
                  >
                    {notification.link.text || 'Visualizar'}
                  </button>
                )}
                {!notification.read && (
                  <button onClick={() => onMarkAsRead(notification.id)} className="text-xs text-slate-400 hover:text-slate-200">
                    Marcar como lida
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {notifications.some(n => !n.read) && notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-700">
          <button onClick={onMarkAllAsRead} className="w-full text-xs text-sky-400 hover:text-sky-300 font-medium py-1.5 rounded-md hover:bg-slate-700 transition-colors">
            Marcar todas como lidas
          </button>
        </div>
      )}
    </div>
  );
};


interface NavbarProps {
  onNavigate: (view: ViewState, params?: any) => void;
  currentView: ViewState; 
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const { isAuthenticated, user, logout, showAuthModal, showUserProfileModal, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const AVATAR_COMPONENTS_MAP: Record<ProfileAvatarId, React.FC<{className?: string}>> = {
    kairosAvatarDefault: KairosAvatarDefault,
    kairosAvatarCoupon: KairosAvatarCoupon,
    kairosAvatarRoulette: KairosAvatarRoulette,
    kairosAvatarTrophy: KairosAvatarTrophy,
    kairosAvatarStore: KairosAvatarStore,
    kairosAvatarGift: KairosAvatarGift,
  };

  let DisplayAvatarComponent: React.FC<{ className?: string }> = KairosAvatarDefault;
  if (user) {
    if (user.customProfileImageUrl) {
      DisplayAvatarComponent = ({ className }) => <img src={user.customProfileImageUrl!} alt={user.nickname} className={`${className} object-cover`} />;
    } else if (user.profileIconId && AVATAR_COMPONENTS_MAP[user.profileIconId]) {
      DisplayAvatarComponent = AVATAR_COMPONENTS_MAP[user.profileIconId];
    }
  }


  const handleNavigationAndScroll = (targetId: string, view: ViewState = 'main') => {
    onNavigate(view); 
    setTimeout(() => {
      if (view === 'main' && targetId) {
        if (targetId === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            const navbarHeight = (document.querySelector('nav')?.offsetHeight || 64);
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }
      } else if (view !== 'main' && targetId === 'hero') { 
         window.scrollTo({ top: 0, behavior: 'smooth' }); 
      }
    }, 0); 
  };

  const handleLogoutClick = () => {
    logout();
    onNavigate('main'); 
  };
  
  const currentNotifications = user?.notifications || [];
  const unreadCount = user ? user.notifications.filter(n => !n.read).length : 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <nav className="bg-slate-800/80 backdrop-blur-md shadow-lg sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" onClick={(e) => {
            e.preventDefault(); 
            handleNavigationAndScroll('hero', 'main');
          }} className="flex items-center" aria-label="KAIROS Prompt Hub - Início">
            <BoltIcon className="h-8 w-8 text-sky-400" />
            <span className="font-bold text-xl ml-2 text-sky-400">KAIROS Hub</span>
          </a>
          <div className="hidden md:flex items-center space-x-1 lg:space-x-1">
            <NavLink 
              onClick={() => handleNavigationAndScroll('hero', 'main')} 
              href="#hero" 
              isActive={currentView === 'main' && (window.location.hash === '#hero' || !window.location.hash.substring(1))}
            >
              Início
            </NavLink>
            <NavLink onClick={() => handleNavigationAndScroll('prompts', 'main')} href="#prompts" >Pacote KAIROS</NavLink>
             <NavLink onClick={() => onNavigate('roulette')} ariaLabel="Roleta KAIROS" isActive={currentView === 'roulette'}>
              <TicketIcon className="w-4 h-4 mr-1 inline-block" /> Roleta KAIROS
            </NavLink>
            <NavLink onClick={() => onNavigate('blogList')} ariaLabel="Centro de Conhecimento" isActive={currentView === 'blogList' || currentView === 'blogPost'}>
              <BookOpenIcon className="w-4 h-4 mr-1 inline-block" /> Conhecimento
            </NavLink>
            <NavLink onClick={() => handleNavigationAndScroll('faq', 'main')} href="#faq">FAQ</NavLink>
            <NavLink onClick={() => onNavigate('legalDoc', {docId: 'terms'})} ariaLabel="Termos de Responsabilidade e Uso" isActive={false}>Termos</NavLink>
            <NavLink onClick={() => handleNavigationAndScroll('cta', 'main')} href="#cta" isButton>Adquirir Pacote</NavLink>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated && user ? (
              <>
                <div ref={notificationRef} className="relative">
                  <button onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)} className="relative p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" aria-label="Notificações">
                      <BellIcon className="w-5 h-5" />
                      {unreadCount > 0 && (
                          <span className="absolute top-1 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                              {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                      )}
                  </button>
                  {isNotificationPanelOpen && (
                    <NotificationPanel
                      notifications={currentNotifications} 
                      onClose={() => setIsNotificationPanelOpen(false)}
                      onMarkAsRead={markNotificationAsRead}
                      onMarkAllAsRead={markAllNotificationsAsRead}
                      onNavigateToLink={onNavigate}
                    />
                  )}
                </div>
                 <button
                  onClick={showUserProfileModal}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  aria-label="Abrir perfil do usuário"
                >
                  <div className="relative mr-2">
                    <DisplayAvatarComponent className="w-6 h-6 text-sky-400 rounded-full" />
                    {user.isVip && <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-slate-800 animate-pulse"></span>}
                  </div>
                  {user.nickname}
                  {user.isVip && <VipBadgeIcon className="w-4 h-4 ml-1 text-amber-400" />}
                  <ChevronDownIcon className="w-4 h-4 ml-1 transition-transform" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => showAuthModal('login')} className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Login">
                  Login
                </button>
                <button onClick={() => showAuthModal('register')} className="px-4 py-2 rounded-md text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 transition-colors" aria-label="Cadastre-se">
                  Cadastre-se
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;