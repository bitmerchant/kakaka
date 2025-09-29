import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserActivityItem } from '../types';
import { SparklesIcon, CheckIcon, UserPlusIcon, TicketIcon } from './Icons'; // Added UserPlusIcon for registration & TicketIcon

const LivePurchaseNotification: React.FC = () => {
  const { userActivity } = useAuth(); 
  const [visibleActivity, setVisibleActivity] = useState<UserActivityItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activityQueue, setActivityQueue] = useState<UserActivityItem[]>([]);
  const [currentTimeoutId, setCurrentTimeoutId] = useState<number | null>(null);
  const [processedActivityIds, setProcessedActivityIds] = useState<Set<string>>(new Set());


  useEffect(() => {
    // Add new, unprocessed activities to the queue
    if (userActivity.length > 0) {
      setActivityQueue(prevQueue => {
        const newActivities = userActivity.filter(
          act => !processedActivityIds.has(act.id) && !prevQueue.find(qAct => qAct.id === act.id)
        );
        return [...prevQueue, ...newActivities.reverse()]; 
      });
    }
  }, [userActivity, processedActivityIds]);

  useEffect(() => {
    if (!isVisible && activityQueue.length > 0) {
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
      }

      const nextActivity = activityQueue[0];
      setActivityQueue(prevQueue => prevQueue.slice(1));
      
      setProcessedActivityIds(prevIds => new Set(prevIds).add(nextActivity.id));
      setVisibleActivity(nextActivity);
      setIsVisible(true);

      const timerId = window.setTimeout(() => {
        setIsVisible(false);
        const hideTimerId = window.setTimeout(() => { 
          setVisibleActivity(null); 
        }, 500); 
        setCurrentTimeoutId(hideTimerId); // Track hide timer for potential cleanup
      }, 5000); 
      setCurrentTimeoutId(timerId);
    }

    return () => {
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
      }
    };
  }, [isVisible, activityQueue, currentTimeoutId]);


  const handleManualClose = () => {
    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId);
    }
    setIsVisible(false);
    const hideTimerId = window.setTimeout(() => {
      setVisibleActivity(null);
    }, 500); // Match CSS transition
    setCurrentTimeoutId(hideTimerId);
  };


  if (!isVisible || !visibleActivity) {
    return null;
  }
  
  const IconForActivity = () => {
    switch(visibleActivity.type) {
        case 'purchase': return <SparklesIcon className="w-8 h-8 text-amber-400" />; 
        case 'registration': return <UserPlusIcon className="w-8 h-8 text-green-400" />;
        case 'roulette_win': return <TicketIcon className="w-8 h-8 text-yellow-400" />;
        default: return <CheckIcon className="w-8 h-8 text-sky-400" />;
    }
  };

  return (
    <div
      className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[150] p-4 rounded-xl shadow-2xl 
                  bg-gradient-to-br from-slate-800 via-slate-700 to-sky-800/70 
                  border-2 border-sky-500/60 text-slate-100 
                  transition-all duration-500 ease-in-out transform
                  ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          <IconForActivity />
        </div>
        <div>
          <p className="text-sm font-semibold">
            <span className="text-sky-300">{visibleActivity.nicknamePart}</span> {visibleActivity.actionText}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(visibleActivity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button 
            onClick={handleManualClose}
            className="ml-4 p-1 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Fechar Notificação"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default LivePurchaseNotification;
