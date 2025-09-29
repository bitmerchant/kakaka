// components/ChatUserProfileModal.tsx
import React from 'react';
import { ChatUser } from '../types';
import { CHAT_ROLES } from '../constants';
import { KairosAvatarDefault, KairosAvatarCoupon, KairosAvatarRoulette, KairosAvatarTrophy, KairosAvatarStore, KairosAvatarGift, VipBadgeIcon, SparklesIcon, CalendarDaysIcon, ClockIcon } from './Icons';

interface ChatUserProfileModalProps {
  user: ChatUser | null;
  currentUser: ChatUser;
  isOpen: boolean;
  onClose: () => void;
  onStartPrivateMessage: (targetUser: ChatUser) => void;
}

const AVATAR_COMPONENTS_MAP = {
    kairosAvatarDefault: KairosAvatarDefault,
    kairosAvatarCoupon: KairosAvatarCoupon,
    kairosAvatarRoulette: KairosAvatarRoulette,
    kairosAvatarTrophy: KairosAvatarTrophy,
    kairosAvatarStore: KairosAvatarStore,
    kairosAvatarGift: KairosAvatarGift,
};

// FIX: Add missing 'stealth' status to fix TypeScript error.
const statusMap: Record<ChatUser['status'], { text: string; color: string }> = {
    online: { text: 'Online', color: 'bg-green-400' },
    away: { text: 'Ausente', color: 'bg-amber-400' },
    dnd: { text: 'Ocupado', color: 'bg-red-500' },
    offline: { text: 'Offline', color: 'bg-slate-500' },
    stealth: { text: 'Invisível', color: 'bg-purple-500' },
};

const timeSince = (timestamp: number | undefined): string => {
    if (timestamp === undefined) return 'desconhecido';
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `há ${Math.floor(interval)} ano${Math.floor(interval) > 1 ? 's' : ''}`;
    interval = seconds / 2592000;
    if (interval > 1) return `há ${Math.floor(interval)} ${Math.floor(interval) > 1 ? 'meses' : 'mês'}`;
    interval = seconds / 86400;
    if (interval > 1) return `há ${Math.floor(interval)} dia${Math.floor(interval) > 1 ? 's' : ''}`;
    interval = seconds / 3600;
    if (interval > 1) return `há ${Math.floor(interval)} hora${Math.floor(interval) > 1 ? 's' : ''}`;
    interval = seconds / 60;
    if (interval > 1) return `há ${Math.floor(interval)} minuto${Math.floor(interval) > 1 ? 's' : ''}`;
    return "agora";
};


const ChatUserProfileModal: React.FC<ChatUserProfileModalProps> = ({ user, currentUser, isOpen, onClose, onStartPrivateMessage }) => {
    if (!isOpen || !user) return null;

    const role = CHAT_ROLES.find(r => r.id === user.roleId) || CHAT_ROLES.find(r => r.id === 'vip')!;
    
    let DisplayAvatarComponent = AVATAR_COMPONENTS_MAP[user.profileIconId || 'kairosAvatarDefault'] || KairosAvatarDefault;
    if (user.avatarUrl) {
      DisplayAvatarComponent = ({ className }) => <img src={user.avatarUrl!} alt={user.nickname} className={`${className} object-cover`} />;
    }

    const userStatus = statusMap[user.status] || statusMap.offline;
    
    return (
        <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm border-2"
                style={{ borderColor: role.color }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 relative">
                     <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-200 transition-colors z-20"
                        aria-label="Fechar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                           <DisplayAvatarComponent className="w-24 h-24 rounded-full border-4" style={{ borderColor: role.color }}/>
                           <span className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full ring-4 ring-slate-800 ${userStatus.color}`} title={userStatus.text}></span>
                        </div>
                        <h2 className="text-2xl font-bold" style={{ color: role.color }}>{user.nickname}</h2>
                        <p className="text-sm text-slate-400">{userStatus.text}</p>
                        
                    </div>
                    
                    <div className="mt-6 border-t border-slate-700 pt-4 space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-400 flex items-center gap-2"><SparklesIcon className="w-4 h-4"/> Rank:</span>
                            <span className="text-amber-300 font-bold">{user.masteryLevel || 'Novato KAIROS'}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-400 flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4"/> Membro há:</span>
                            <span className="text-slate-300">{timeSince(user.registrationDate)}</span>
                        </div>
                        {/* FIX: Add last activity timestamp display */}
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-400 flex items-center gap-2"><ClockIcon className="w-4 h-4"/> Última Atividade:</span>
                            <span className="text-slate-300">{timeSince(user.lastActivityTimestamp)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-400 flex items-center gap-2"><VipBadgeIcon className="w-4 h-4"/> Cargo:</span>
                            <span className="font-semibold p-1 px-2 text-xs rounded-md" style={{ backgroundColor: `${role.color}20`, color: role.color }}>
                                {role.name}
                            </span>
                        </div>
                    </div>
                     <div className="mt-4 border-t border-slate-700 pt-4">
                        <h4 className="text-sm font-semibold text-slate-400 mb-2 text-center">Bio</h4>
                        <p className="text-slate-300 italic text-center text-sm">"{user.bio || 'Membro do KAIROS Hub.'}"</p>
                    </div>

                    <div className="mt-6 flex gap-3">
                        {user.id !== currentUser.id && (
                            <button
                                onClick={() => onStartPrivateMessage(user)}
                                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
                            >
                                Mensagem Privada
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatUserProfileModal;
