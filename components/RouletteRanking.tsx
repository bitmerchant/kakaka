import React from 'react';
import { RouletteWinner, ProfileAvatarId } from '../types';
import { 
    KairosAvatarDefault, KairosAvatarCoupon, KairosAvatarRoulette, 
    KairosAvatarTrophy, KairosAvatarStore, KairosAvatarGift, UserCircleIcon
} from './Icons';

interface RouletteRankingProps {
  winners: RouletteWinner[];
}

const KAIROS_AVATAR_COMPONENTS_MAP: Record<ProfileAvatarId, React.FC<{className?: string}>> = {
  kairosAvatarDefault: KairosAvatarDefault,
  kairosAvatarCoupon: KairosAvatarCoupon,
  kairosAvatarRoulette: KairosAvatarRoulette,
  kairosAvatarTrophy: KairosAvatarTrophy,
  kairosAvatarStore: KairosAvatarStore,
  kairosAvatarGift: KairosAvatarGift,
};


const RouletteRanking: React.FC<RouletteRankingProps> = ({ winners }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "agora mesmo";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
      <h3 className="text-xl font-semibold text-sky-400 mb-6 text-center">🏆 Ranking da Roleta KAIROS 🏆</h3>
      {winners.length === 0 ? (
        <p className="text-slate-400 text-center py-4">Ainda não há vencedores recentes. Gire a roleta e seja o primeiro!</p>
      ) : (
        <ul className="space-y-3">
          {winners.map((winner) => {
            let AvatarComponent: React.FC<{ className?: string }> = KairosAvatarDefault;
            if (winner.customProfileImageUrl) {
              AvatarComponent = ({ className }) => (
                <img 
                  src={winner.customProfileImageUrl!} 
                  alt={winner.nicknamePart} 
                  className={`${className} object-cover`} // Ensure object-cover for custom images
                />
              );
            } else if (winner.profileIconId && KAIROS_AVATAR_COMPONENTS_MAP[winner.profileIconId]) {
              AvatarComponent = KAIROS_AVATAR_COMPONENTS_MAP[winner.profileIconId];
            }
            
            return (
              <li
                key={winner.id}
                className="flex items-center p-3 bg-slate-700/50 rounded-lg shadow-md hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 mr-3 rounded-full flex-shrink-0 overflow-hidden border-2 border-sky-600/50">
                   <AvatarComponent className="w-full h-full text-sky-300" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm sm:text-base font-medium text-slate-200">
                    <span className="text-amber-400">{winner.nicknamePart}</span> ganhou <strong className="text-green-400">{winner.prize}</strong>!
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(winner.timestamp)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RouletteRanking;