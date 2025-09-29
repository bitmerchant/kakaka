import React, { useState, useEffect, useCallback } from 'react';
import PrizeRoulette from '../components/PrizeRoulette';
import RouletteRanking from '../components/RouletteRanking';
import { useAuth } from '../contexts/AuthContext';
import { 
    ROULETTE_PRIZES_CONFIG, ROULETTE_WIN_MESSAGES, ROULETTE_LOSS_MESSAGES, 
    ROULETTE_GENERAL_SPIN_COOLDOWN_MESSAGE_FORMAT, ROULETTE_SPIN_COOLDOWN_HOURS, ROULETTE_COUPON_WIN_COOLDOWN_HOURS,
    ROULETTE_ALREADY_HAS_DISCOUNT_MESSAGE, COUPON_EXPIRY_HOURS, DICE_GAME_MESSAGES,
    ROULETTE_COUPON_WIN_COOLDOWN_MESSAGE_FORMAT, ROULETTE_DEVICE_COOLDOWN_MESSAGE,
    GUEST_DEVICE_ALREADY_WON_MESSAGE, WELCOME_COUPON_NOTIFICATION_TITLE
} from '../constants';
import { AwardedDiscount, RouletteSegment, ViewState, KAIROS_PACKAGE_ID, GuestWinData } from '../types';
import { SparklesIcon, TicketIcon, GiftIcon, CheckIcon, ShieldCheckIcon, KeyIcon, UserPlusIcon, CalendarDaysIcon } from '../components/Icons';
import { KAIROS_PACKAGE_DESCRIPTION } from '../constants';


interface ConfettiParticleProps {
  id: number;
  style: React.CSSProperties;
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = ({ id, style }) => (
  <div
    key={id}
    className="absolute w-2 h-2 rounded-full animate-fall"
    style={style}
  />
);

const ConfettiExplosion: React.FC<{isWin: boolean}> = ({ isWin }) => {
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: isWin ? 70 : 30 }).map((_, i) => { 
      const randomColor = isWin 
        ? `hsl(${Math.random() * 60 + 80}, 70%, 60%)` 
        : `hsl(${Math.random() * 60}, 70%, 60%)`; 
      const randomX = Math.random() * 100; 
      const randomDelay = Math.random() * 0.5; 
      const randomDuration = 1 + Math.random() * (isWin ? 1.5 : 0.8); 
      return (
        <ConfettiParticle
          key={i}
          id={i}
          style={{
            background: randomColor,
            left: `${randomX}vw`,
            top: `-20px`, 
            animationDelay: `${randomDelay}s`,
            animationDuration: `${randomDuration}s`,
            transform: `translateX(${(Math.random() -0.5) * (isWin ? 400 : 200)}px) translateY(${Math.random() * 100}px) rotate(${Math.random() * 360}deg)`
          }}
        />
      );
    });
    setParticles(newParticles);
  }, [isWin]);

  if (particles.length === 0) return null;

  return <div className="fixed inset-0 w-full h-full pointer-events-none z-[200] overflow-hidden">{particles}</div>;
};

const formatDate = (timestamp: number | null | undefined, includeTime = true) => {
  if (!timestamp) return "N/A";
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return new Date(timestamp).toLocaleString('pt-BR', options);
};

// Simplified display for guest wins before registration
const GuestWinPrompt: React.FC<{ onRegister: () => void }> = ({ onRegister }) => (
  <div className="p-4 rounded-lg shadow-lg border bg-yellow-500/30 border-yellow-400 w-full max-w-lg text-center">
    <h3 className="text-2xl font-bold text-yellow-300">{ROULETTE_WIN_MESSAGES.guestRegisterPrompt}</h3>
    <button
      onClick={onRegister}
      className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-md transition-colors flex items-center justify-center mx-auto"
    >
      <UserPlusIcon className="w-5 h-5 mr-2 inline"/>
      Cadastre-se Agora
    </button>
  </div>
);


const ClaimedCouponDisplay: React.FC<{ coupon: AwardedDiscount; onRedeem: () => void; title?: string; message?: string }> = ({ coupon, onRedeem, title, message }) => {
  return (
    <div className="p-4 rounded-lg shadow-lg border bg-green-600/30 border-green-500 w-full max-w-lg text-center">
      <h3 className="text-2xl font-bold text-green-300">{title || "🎉 Cupom Ativo! 🎉"}</h3>
      {message && <p className="text-slate-200 mt-1 text-sm sm:text-base">{message}</p>}
      <p className="text-slate-200 mt-1 text-sm sm:text-base">
        Código: <span className="font-mono text-amber-300">{coupon.code}</span>
      </p>
      <p className="text-slate-200 mt-1 text-sm sm:text-base">
        Descrição: {coupon.percentage}% OFF no Pacote KAIROS ULTIMATE
      </p>
      <p className="text-xs text-slate-400 mt-1 flex items-center justify-center">
        <CalendarDaysIcon className="w-3.5 h-3.5 mr-1 text-slate-400"/>
        Expira em: {formatDate(coupon.expiry, true)}
      </p>
      <button
        onClick={onRedeem}
        className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md shadow-md transition-colors flex items-center justify-center mx-auto"
      >
        <GiftIcon className="w-5 h-5 mr-2 inline"/>
        Usar Cupom Agora
      </button>
    </div>
  );
};

const Dice: React.FC<{ face: number, rolling: boolean }> = ({ face, rolling }) => {
    const baseClasses = "w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-sky-300 bg-sky-500/30 shadow-xl flex items-center justify-center text-4xl sm:text-5xl font-bold text-white transition-all duration-300";
    const rollingClasses = "animate-[spin_1s_linear_infinite]"; 
    
    const dots = [];
    if (face === 1) dots.push(<div key="d1" className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute"></div>);
    if (face === 2) {
        dots.push(<div key="d2-1" className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute -translate-x-3 -translate-y-3 sm:-translate-x-4 sm:-translate-y-4"></div>);
        dots.push(<div key="d2-2" className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4"></div>);
    }
    if (face === 3) {
        dots.push(<div key="d3-1" className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute -translate-x-3 -translate-y-3 sm:-translate-x-4 sm:-translate-y-4"></div>);
        dots.push(<div key="d3-2" className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute"></div>);
        dots.push(<div key="d3-3" className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full absolute translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4"></div>);
    }

    return (
        <div className={`${baseClasses} ${rolling ? rollingClasses : ''} relative`}>
            {!rolling && dots}
            {rolling && <span className="text-2xl">🎲</span>}
        </div>
    );
};


interface PrizeRoulettePageProps {
    onNavigate: (view: ViewState, params?: any) => void;
    guestWonPrizeForRegistration: AwardedDiscount | null; // From AppContent, for post-registration processing
    setGuestWonPrizeForRegistration: (prize: AwardedDiscount | null) => void;
    justRegisteredAndClaimedGuestPrize: AwardedDiscount | null; // From AppContent, indicates guest prize was just added
    setJustRegisteredAndClaimedGuestPrize: (prize: AwardedDiscount | null) => void;
    onInitiatePurchase: () => void;
}

type PagePhase = 'loading' | 'dice_prompt' | 'dice_rolling' | 'dice_result' | 'roulette_active';

const formatTimeLeft = (ms: number): { hours: number; minutes: number } => {
    const totalMinutes = Math.ceil(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
};


const PrizeRoulettePage: React.FC<PrizeRoulettePageProps> = ({ 
    onNavigate, 
    guestWonPrizeForRegistration, setGuestWonPrizeForRegistration,
    justRegisteredAndClaimedGuestPrize, setJustRegisteredAndClaimedGuestPrize,
    onInitiatePurchase 
}) => {
  const { user, isAuthenticated, spinRoulette, getRouletteWinners, showAuthModal, getActiveDiscount, addNotification, addRouletteWinner, discountToApplyOnNextPurchase, setDiscountForNextPurchase, updateSpinsFromDiceRoll } = useAuth();
  
  const [rotation, setRotation] = useState(0);
  const [spinningRoulette, setSpinningRoulette] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'fast-spin' | 'landing' | 'none'>('none');
  const [rouletteResultMessage, setRouletteResultMessage] = useState<string | null>(null);
  const [rouletteResultTitle, setRouletteResultTitle] = useState<string | null>(null);
  const [rouletteResultIsWin, setRouletteResultIsWin] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null); 
  const [canSpinRouletteButton, setCanSpinRouletteButton] = useState(true);
  const [rouletteSpinButtonText, setRouletteSpinButtonText] = useState("GIRAR ROLETA!");
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Specific state for a coupon a guest won *in this current browser session* before registering
  const [guestJustWonPrizeInfo, setGuestJustWonPrizeInfo] = useState<AwardedDiscount | null>(null);
  // State to control display of coupon after a winning guest registers
  const [showPostRegistrationGuestWinDisplay, setShowPostRegistrationGuestWinDisplay] = useState<AwardedDiscount | null>(null);
  const [deviceBlockedForGuestMessage, setDeviceBlockedForGuestMessage] = useState<string | null>(null);

  const [displayedSpinsInfo, setDisplayedSpinsInfo] = useState<string | null>(null);
  
  const [pagePhase, setPagePhase] = useState<PagePhase>('loading'); 
  const [diceFace, setDiceFace] = useState(1);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [diceResultMessage, setDiceResultMessage] = useState<string | null>(null);

  const rouletteWinners = getRouletteWinners();

  const GUEST_SPINS_KEY = 'kairosGuestDiceSpins';
  const GUEST_USED_SPINS_KEY = 'kairosGuestDiceSpinsUsed';
  const GUEST_ROLLED_DICE_KEY = 'kairosGuestRolledDice_v1';
  const DEVICE_LAST_COUPON_WIN_KEY = 'kairosDeviceLastCouponWinTimestamp_v1';
  const GUEST_WON_ROULETTE_PRIZE_SESSION_KEY = 'kairosGuestWonRoulettePrize_v1';

  useEffect(() => {
    if (justRegisteredAndClaimedGuestPrize) {
        setShowPostRegistrationGuestWinDisplay(justRegisteredAndClaimedGuestPrize);
        setGuestJustWonPrizeInfo(null); // Clear this if it was set from previous guest session
        setRouletteResultMessage(null); // Clear any loss/win message from roulette spin
        setInfoMessage(null); // Clear general info message
        setPagePhase('roulette_active'); // Ensure roulette is active to show the claimed prize
        setJustRegisteredAndClaimedGuestPrize(null); // Consume this prop
    }
  }, [justRegisteredAndClaimedGuestPrize, setJustRegisteredAndClaimedGuestPrize]);


  const checkCooldownAndAvailability = useCallback(() => {
    let canSpin = true;
    let buttonText = "GIRAR ROLETA!";
    let currentInfoMsg: string | null = null;
    let currentSpinsDisplay: string | null = null;
    const now = Date.now();

    if (pagePhase !== 'roulette_active') {
        setCanSpinRouletteButton(false);
        setInfoMessage(infoMessage); // Preserve dice win message if any
        return;
    }
     // If showing post-registration win, block spins and update button
    if (showPostRegistrationGuestWinDisplay) {
        setCanSpinRouletteButton(false);
        setRouletteSpinButtonText("Usar Cupom Agora");
        setInfoMessage(null); // Clear other messages
        setDisplayedSpinsInfo(`🎯 Giros restantes: ${Math.max(0, (user?.totalSpinsAvailable || 0) - (user?.spinsUsed || 0))}`);
        return;
    }

    if (isAuthenticated && user) {
        currentSpinsDisplay = `🎯 Giros restantes: ${Math.max(0, user.totalSpinsAvailable - user.spinsUsed)}`;
        if (user.lastCouponWinTimestamp) {
            const userCouponWinCooldownMillis = ROULETTE_COUPON_WIN_COOLDOWN_HOURS * 60 * 60 * 1000;
            if (now - user.lastCouponWinTimestamp < userCouponWinCooldownMillis) {
                const timeLeft = userCouponWinCooldownMillis - (now - user.lastCouponWinTimestamp);
                const { hours, minutes } = formatTimeLeft(timeLeft);
                // Check if this cooldown was inherited from device
                const deviceTimestampRaw = localStorage.getItem(DEVICE_LAST_COUPON_WIN_KEY);
                if (deviceTimestampRaw && parseInt(deviceTimestampRaw, 10) === user.lastCouponWinTimestamp) {
                     currentInfoMsg = ROULETTE_DEVICE_COOLDOWN_MESSAGE(hours, minutes);
                } else {
                     currentInfoMsg = ROULETTE_COUPON_WIN_COOLDOWN_MESSAGE_FORMAT(hours, minutes);
                }
                canSpin = false;
                buttonText = "AGUARDE";
            }
        }
        
        if (canSpin) { // Only if not already on 24h cooldown
            const activeUserRouletteDiscount = user.awardedDiscounts.find(d => d.source ==='roulette' && !d.claimed && d.expiry > Date.now());
            if (activeUserRouletteDiscount) {
                 setShowPostRegistrationGuestWinDisplay(activeUserRouletteDiscount); // Show it like a claimed guest win
                 currentInfoMsg = null; 
                 canSpin = false;
                 buttonText = "Usar Cupom Agora";
            } else if (user.spinsUsed >= user.totalSpinsAvailable) {
                currentInfoMsg = "Você utilizou todos os seus giros. Role o dado novamente para mais chances!";
                canSpin = false;
                buttonText = "SEM GIROS";
                setTimeout(() => setPagePhase('dice_prompt'), 0); 
            } else {
                const lastSpinTimestamp = user.lastRouletteSpinTimestamp;
                const generalCooldownMillis = ROULETTE_SPIN_COOLDOWN_HOURS * 60 * 60 * 1000;
                if (lastSpinTimestamp && (now - lastSpinTimestamp < generalCooldownMillis)) {
                    const timeLeft = generalCooldownMillis - (now - lastSpinTimestamp);
                    const { hours, minutes } = formatTimeLeft(timeLeft);
                    currentInfoMsg = ROULETTE_GENERAL_SPIN_COOLDOWN_MESSAGE_FORMAT(hours, minutes);
                    canSpin = false;
                    buttonText = "AGUARDE";
                }
            }
        }
    } else { // Guest Logic
        if (guestJustWonPrizeInfo) {
            currentInfoMsg = ROULETTE_WIN_MESSAGES.guestRegisterPrompt;
            canSpin = false;
            buttonText = "REGISTRE-SE";
            currentSpinsDisplay = null; // Don't show spin count, focus on registration
        } else if (deviceBlockedForGuestMessage) {
            currentInfoMsg = deviceBlockedForGuestMessage;
            canSpin = false;
            buttonText = "REGISTRE-SE";
            currentSpinsDisplay = null;
        } else {
            const guestTotalSpinsRaw = sessionStorage.getItem(GUEST_SPINS_KEY);
            const guestUsedSpinsRaw = sessionStorage.getItem(GUEST_USED_SPINS_KEY);
            const spinsAvailable = guestTotalSpinsRaw ? parseInt(guestTotalSpinsRaw, 10) : 0;
            const spinsAlreadyUsed = guestUsedSpinsRaw ? parseInt(guestUsedSpinsRaw, 10) : 0;
            currentSpinsDisplay = `🎯 Giros de visitante: ${Math.max(0, spinsAvailable - spinsAlreadyUsed)}`;

            if (spinsAlreadyUsed >= spinsAvailable) {
                currentInfoMsg = ROULETTE_LOSS_MESSAGES.guestLostSpinAndNeedsRegister;
                canSpin = false;
                buttonText = "REGISTRE-SE";
            } else if (!infoMessage || !infoMessage.startsWith(DICE_GAME_MESSAGES.getWinMessage(0).split(" ")[0])) { // Preserve dice win message if already shown
                 currentInfoMsg = "Você tem giros de visitante! Tente a sorte.";
            }
        }
    }
    
    if (!rouletteResultMessage && !guestJustWonPrizeInfo && !showPostRegistrationGuestWinDisplay) {
      if(currentInfoMsg) setInfoMessage(currentInfoMsg);
    } else {
      setInfoMessage(null); // Clear general info if a result or specific prompt is shown
    }
    
    setDisplayedSpinsInfo(currentSpinsDisplay);
    setCanSpinRouletteButton(canSpin);
    setRouletteSpinButtonText(buttonText);

  }, [
      user, isAuthenticated, pagePhase, guestJustWonPrizeInfo, deviceBlockedForGuestMessage,
      showPostRegistrationGuestWinDisplay, rouletteResultMessage, infoMessage 
    ]);


  useEffect(() => {
    if (pagePhase === 'loading') {
        let needsDiceRoll = true;
        let goToDicePrompt = true; // Assume dice roll is needed
        const now = Date.now();

        if (isAuthenticated && user) {
            const spinsLeft = user.totalSpinsAvailable - user.spinsUsed;
            const couponWinCooldownActive = user.lastCouponWinTimestamp && (now - user.lastCouponWinTimestamp < ROULETTE_COUPON_WIN_COOLDOWN_HOURS * 60 * 60 * 1000);
            const generalSpinCooldownActive = user.lastRouletteSpinTimestamp && (now - user.lastRouletteSpinTimestamp < ROULETTE_SPIN_COOLDOWN_HOURS * 60 * 60 * 1000);
            
            if (couponWinCooldownActive) { // Highest priority: 24h win cooldown
                goToDicePrompt = false;
            } else if (spinsLeft > 0 && !generalSpinCooldownActive) { // Has spins and not on 12h general cooldown
                goToDicePrompt = false;
            } else if (generalSpinCooldownActive && spinsLeft <=0) { // On 12h cooldown AND no spins
                 goToDicePrompt = false; // Will show cooldown message on roulette page
            } else if (spinsLeft <=0 && !generalSpinCooldownActive) { // No spins, not on 12h cooldown
                 goToDicePrompt = true; // Needs to roll dice
            } else if (generalSpinCooldownActive && spinsLeft > 0) { // On 12h cooldown but has spins
                 goToDicePrompt = false; // Will show cooldown, but has spins for later
            }


        } else { // Guest
            const deviceLastCouponWinTimestampRaw = localStorage.getItem(DEVICE_LAST_COUPON_WIN_KEY);
            if (deviceLastCouponWinTimestampRaw) {
                const deviceWinTime = parseInt(deviceLastCouponWinTimestampRaw, 10);
                if (now - deviceWinTime < ROULETTE_COUPON_WIN_COOLDOWN_HOURS * 60 * 60 * 1000) {
                    setDeviceBlockedForGuestMessage(GUEST_DEVICE_ALREADY_WON_MESSAGE);
                    goToDicePrompt = false; // Device on cooldown from a previous guest win
                }
            }

            if (goToDicePrompt) { // Only if not device-blocked
                const guestRolledDice = sessionStorage.getItem(GUEST_ROLLED_DICE_KEY);
                if (guestRolledDice === 'true') {
                    const guestTotalSpinsRaw = sessionStorage.getItem(GUEST_SPINS_KEY);
                    const guestUsedSpinsRaw = sessionStorage.getItem(GUEST_USED_SPINS_KEY);
                    const guestTotalSpins = guestTotalSpinsRaw ? parseInt(guestTotalSpinsRaw, 10) : 0;
                    const guestUsedSpins = guestUsedSpinsRaw ? parseInt(guestUsedSpinsRaw, 10) : 0;
                    if (guestUsedSpins < guestTotalSpins) {
                        goToDicePrompt = false; // Guest rolled dice and has spins left
                    }
                }
            }
        }
        setPagePhase(goToDicePrompt ? 'dice_prompt' : 'roulette_active');
    }
  }, [pagePhase, isAuthenticated, user]);


  useEffect(() => {
    if (pagePhase === 'roulette_active') {
        checkCooldownAndAvailability();
    }
  }, [pagePhase, checkCooldownAndAvailability, user?.awardedDiscounts, user?.totalSpinsAvailable, user?.spinsUsed, user?.lastCouponWinTimestamp, user?.lastRouletteSpinTimestamp]); // Add all relevant user fields
  

  useEffect(() => {
    if(pagePhase === 'dice_result' || pagePhase === 'roulette_active') {
        if (isAuthenticated && user) {
            setDisplayedSpinsInfo(`🎯 Giros restantes: ${Math.max(0, user.totalSpinsAvailable - user.spinsUsed)}`);
        } else {
            const guestSpinsRaw = sessionStorage.getItem(GUEST_SPINS_KEY);
            const guestSpins = guestSpinsRaw ? parseInt(guestSpinsRaw, 10) : 0;
            const guestUsedSpinsRaw = sessionStorage.getItem(GUEST_USED_SPINS_KEY);
            const guestUsed = guestUsedSpinsRaw ? parseInt(guestUsedSpinsRaw, 10) : 0;
            setDisplayedSpinsInfo(`🎯 Giros de visitante: ${Math.max(0, guestSpins - guestUsed)}`);
        }
    }
  }, [pagePhase, user, isAuthenticated, diceFace]); // Re-check spins when diceFace changes (means dice roll happened)


  const handleDiceRoll = () => {
    if (isDiceRolling) return;
    setIsDiceRolling(true);
    setDiceResultMessage(DICE_GAME_MESSAGES.rolling);
    setInfoMessage(null); 
    setRouletteResultMessage(null); 
    setGuestJustWonPrizeInfo(null);
    setShowPostRegistrationGuestWinDisplay(null);

    let rollCount = 0;
    const intervalId = setInterval(() => {
      setDiceFace(Math.floor(Math.random() * 3) + 1);
      rollCount++;
      if (rollCount > 15) { 
        clearInterval(intervalId);
        const resultSpins = Math.floor(Math.random() * 3) + 1; 
        setDiceFace(resultSpins);
        setIsDiceRolling(false);
        const diceWinMsg = DICE_GAME_MESSAGES.getWinMessage(resultSpins);
        setDiceResultMessage(diceWinMsg);
        setInfoMessage(diceWinMsg); 
        
        if (isAuthenticated && user) {
          updateSpinsFromDiceRoll(resultSpins); 
        } else { 
          sessionStorage.setItem(GUEST_SPINS_KEY, resultSpins.toString());
          sessionStorage.setItem(GUEST_USED_SPINS_KEY, "0");
          sessionStorage.setItem(GUEST_ROLLED_DICE_KEY, 'true');
        }
        setPagePhase('dice_result');
      }
    }, 100);
  };

  const proceedToRoulette = () => {
    setPagePhase('roulette_active');
    setDiceResultMessage(null); 
  };

  const handleRouletteSpin = async () => {
    if (spinningRoulette || !canSpinRouletteButton) {
      if (!isAuthenticated && (guestJustWonPrizeInfo || deviceBlockedForGuestMessage || rouletteSpinButtonText === "REGISTRE-SE")) {
          showAuthModal('register');
          return;
      } else if (isAuthenticated && user && (showPostRegistrationGuestWinDisplay || rouletteSpinButtonText === "Usar Cupom Agora" || rouletteSpinButtonText === "CUPOM ATIVO!")) {
           handleRedeemClick(); 
           return;
      }
      return;
    }
    
    setSpinningRoulette(true);
    setRouletteResultMessage(null);
    setRouletteResultTitle(null);
    setShowConfetti(false);
    setGuestJustWonPrizeInfo(null);
    setShowPostRegistrationGuestWinDisplay(null);
    if (infoMessage && !infoMessage.startsWith(DICE_GAME_MESSAGES.getWinMessage(0).split(" ")[0])) { 
        setInfoMessage(null);
    }

    // --- Two-Phase Animation Logic ---

    // 1. Start Fast Spin
    setAnimationPhase('fast-spin');
    setRotation(prev => prev + 360 * 5); // Start a fast, long spin

    // 2. Get the result from the backend while the fast spin is happening
    const { prizeSegment, error } = await spinRoulette(); 

    if (prizeSegment) {
      const prizeIndex = ROULETTE_PRIZES_CONFIG.findIndex(s => s.id === prizeSegment.id);
      const baseRotation = rotation + 360 * 4; // Ensure it spins a few more times
      const segmentAngle = 360 / ROULETTE_PRIZES_CONFIG.length;
      const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
      const finalAngle = (prizeIndex * segmentAngle) + (segmentAngle / 2) + randomOffset;
      const targetRotation = baseRotation - finalAngle;

      // 3. Transition to Landing Phase
      setTimeout(() => {
        setAnimationPhase('landing');
        setRotation(targetRotation);
      }, 100); // Short delay to ensure the fast-spin class applies before landing

      // 4. Show results after the landing animation finishes (e.g., 4 seconds for landing)
      const winTimestamp = Date.now();
      setTimeout(() => {
        setAnimationPhase('none');
        setSpinningRoulette(false);
        setRouletteResultIsWin(prizeSegment.type === 'prize');
        setShowConfetti(true);
        
        if (prizeSegment.type === 'prize' && prizeSegment.prizePercentage) {
          setRouletteResultTitle(ROULETTE_WIN_MESSAGES.title);
          
          const newAwardedDiscount: AwardedDiscount = {
            id: `KRS_ROUL_${(user?.id || 'GUEST').slice(-4)}_${winTimestamp}`,
            percentage: prizeSegment.prizePercentage,
            expiry: winTimestamp + (COUPON_EXPIRY_HOURS * 60 * 60 * 1000),
            source: 'roulette',
            claimed: false,
            code: `ROUL${prizeSegment.prizePercentage}-${winTimestamp.toString().slice(-5)}`,
            winTimestamp: winTimestamp,
          };
          
          if (!isAuthenticated) {
            setGuestJustWonPrizeInfo(newAwardedDiscount);
            setGuestWonPrizeForRegistration(newAwardedDiscount);
            localStorage.setItem(DEVICE_LAST_COUPON_WIN_KEY, winTimestamp.toString()); 
            const guestWinForRanking: GuestWinData = { 
                prizeText: prizeSegment.text, 
                prizePercentage: prizeSegment.prizePercentage, 
                timestamp: winTimestamp 
            };
            sessionStorage.setItem(GUEST_WON_ROULETTE_PRIZE_SESSION_KEY, JSON.stringify(guestWinForRanking));
            sessionStorage.setItem('kairosGuestRouletteSpun_v1', 'true'); 
          } else if (user) { 
            setShowPostRegistrationGuestWinDisplay(newAwardedDiscount);
            setRouletteResultMessage(null);
            addRouletteWinner({
                nicknamePart: `${user.nickname.substring(0,6)}...`,
                prize: `${newAwardedDiscount.percentage}% OFF`,
                timestamp: newAwardedDiscount.winTimestamp,
                profileIconId: user.profileIconId
            });
          }

        } else { 
          setRouletteResultTitle(ROULETTE_LOSS_MESSAGES.title);
          setRouletteResultMessage(prizeSegment.text); 
           if (!isAuthenticated) { 
            localStorage.setItem('kairosGuestLostSpin_v1', 'true'); 
            sessionStorage.setItem('kairosGuestRouletteSpun_v1', 'true');
          }
        }
        checkCooldownAndAvailability(); 
      }, 4000); // This must match the duration of the 'landing' animation
    } else { 
      setAnimationPhase('none');
      setRouletteResultTitle("Atenção");
      setRouletteResultMessage(error || "Ocorreu um erro ao girar a roleta.");
      setRouletteResultIsWin(false);
      setSpinningRoulette(false);
      setShowConfetti(false);
      if (!isAuthenticated && !guestJustWonPrizeInfo) {
          localStorage.setItem('kairosGuestLostSpin_v1', 'true');
          sessionStorage.setItem('kairosGuestRouletteSpun_v1', 'true');
      }
      checkCooldownAndAvailability();
    }
  };

  const handleRedeemClick = () => {
    if (isAuthenticated && user) {
        const couponToUse = discountToApplyOnNextPurchase || showPostRegistrationGuestWinDisplay || getActiveDiscount(user.id);
        if (couponToUse && couponToUse.source === 'roulette') {
            setDiscountForNextPurchase(couponToUse); 
            onInitiatePurchase();
        }
    } else if (!isAuthenticated && guestJustWonPrizeInfo) { 
        showAuthModal('register');
    }
  };

  const rules = [
    { text: `Role o dado para determinar quantos giros da roleta você receberá (1, 2 ou 3).`, icon: SparklesIcon, iconColor: "text-purple-400"},
    { text: `Após ganhar um cupom, haverá um cooldown de ${ROULETTE_COUPON_WIN_COOLDOWN_HOURS} horas antes de poder girar novamente (válido para usuário e dispositivo). Se não ganhar cupom, o cooldown entre tentativas de giro é de ${ROULETTE_SPIN_COOLDOWN_HOURS} horas.`, icon: KeyIcon, iconColor: "text-yellow-400" },
    { text: "Visitantes jogam o dado e rodam a roleta com os giros obtidos. É necessário criar uma conta ou fazer login para resgatar prêmios e ter os ganhos salvos no ranking.", icon: ShieldCheckIcon, iconColor: "text-blue-400" },
    { text: `Cupons ganhos são válidos por ${COUPON_EXPIRY_HOURS} horas e aplicáveis na compra do Pacote KAIROS ULTIMATE.`, icon: TicketIcon, iconColor: "text-pink-400" },
    { text: "Apenas um cupom da roleta pode estar ativo por vez. Use seu cupom atual antes de tentar ganhar outro.", icon: GiftIcon, iconColor: "text-green-400" },
  ];
  
  if (pagePhase === 'loading') {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-900">
            <SparklesIcon className="w-16 h-16 text-sky-400 animate-pulse" />
        </div>
    );
  }

  return (
    <section id="prize-roulette" className="py-12 md:py-16 bg-gradient-to-br from-slate-900 via-purple-900 to-sky-900/80 text-slate-100 min-h-[calc(100vh-4rem)] overflow-x-hidden">
      {showConfetti && <ConfettiExplosion isWin={rouletteResultIsWin} />}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8 md:mb-10">
          <TicketIcon className="w-20 h-20 sm:w-24 sm:h-24 text-amber-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 mb-3">
            {pagePhase === 'roulette_active' ? "Roleta de Prêmios KAIROS" : "Destrave Seus Giros!"}
          </h2>
           <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            {pagePhase === 'roulette_active' 
                ? "Tente sua sorte e ganhe cupons exclusivos para o Pacote KAIROS ULTIMATE!" 
                : (isDiceRolling ? DICE_GAME_MESSAGES.rolling : diceResultMessage || DICE_GAME_MESSAGES.prompt)
            }
          </p>
        </header>

        {(pagePhase === 'dice_prompt' || pagePhase === 'dice_rolling' || pagePhase === 'dice_result') && (
            <div className="flex flex-col items-center justify-center my-8">
                <Dice face={diceFace} rolling={isDiceRolling} />
                {diceResultMessage && !isDiceRolling && (
                    <p className={`mt-4 text-xl font-semibold ${diceFace > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {diceResultMessage}
                    </p>
                )}
                 <button
                    onClick={pagePhase === 'dice_result' ? proceedToRoulette : handleDiceRoll}
                    disabled={isDiceRolling}
                    className={`mt-6 px-8 py-4 text-lg sm:text-xl font-bold rounded-lg shadow-xl transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900 min-w-[280px]
                                ${isDiceRolling ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-700 hover:from-sky-600 hover:via-blue-700 hover:to-cyan-800 text-white focus:ring-sky-400'}`}
                >
                    {isDiceRolling ? DICE_GAME_MESSAGES.buttonTextRolling : (pagePhase === 'dice_result' ? DICE_GAME_MESSAGES.buttonTextResult : DICE_GAME_MESSAGES.buttonTextPrompt)}
                </button>
            </div>
        )}

        {pagePhase === 'roulette_active' && (
            <div className="flex flex-col items-center">
            <PrizeRoulette segments={ROULETTE_PRIZES_CONFIG} rotation={rotation} animationPhase={animationPhase} />

            <div className="my-4 text-center w-full max-w-lg min-h-[120px] flex flex-col justify-center items-center">
                {guestJustWonPrizeInfo ? (
                    <GuestWinPrompt onRegister={() => showAuthModal('register')} />
                ) : showPostRegistrationGuestWinDisplay ? (
                    <ClaimedCouponDisplay 
                        coupon={showPostRegistrationGuestWinDisplay} 
                        onRedeem={handleRedeemClick}
                        title="🎉 Cupom Adicionado à Conta! 🎉"
                        message="Seu prêmio ganho como visitante agora está vinculado à sua conta."
                    />
                ) : rouletteResultMessage ? (
                <div className={`p-4 rounded-lg shadow-lg border w-full ${rouletteResultIsWin ? 'bg-green-600/30 border-green-500' : 'bg-red-600/30 border-red-500'}`}>
                    <h3 className={`text-2xl font-bold ${rouletteResultIsWin ? 'text-green-300' : 'text-red-300'}`}>{rouletteResultTitle}</h3>
                    <p className="text-slate-200 mt-1 text-sm sm:text-base">{rouletteResultMessage}</p>
                    {rouletteResultIsWin && (
                        <p className="text-xs text-slate-400 mt-1">{ROULETTE_WIN_MESSAGES.validityText()}</p>
                    )}
                    {/* Button to redeem for logged-in user is now handled by showPostRegistrationGuestWinDisplay after spin */}
                </div>
                ) : infoMessage ? ( 
                    <div className={`p-3 rounded-lg shadow-md ${infoMessage.includes("Parabéns") || infoMessage.includes(DICE_GAME_MESSAGES.getWinMessage(0).split(" ")[0]) || infoMessage.includes("Você ganhou") || infoMessage.includes(ROULETTE_WIN_MESSAGES.guestRegisterPrompt) ? 'bg-yellow-600/30 border-yellow-500 text-yellow-300' : infoMessage.includes("⚠️") || infoMessage.includes(GUEST_DEVICE_ALREADY_WON_MESSAGE) ? 'bg-red-600/30 border-red-500 text-red-300' : 'bg-sky-600/30 border-sky-500 text-sky-300'} text-sm sm:text-base w-full`}>
                        {infoMessage}
                    </div>
                ) : null }

                {displayedSpinsInfo && !rouletteResultMessage && !guestJustWonPrizeInfo && !showPostRegistrationGuestWinDisplay && (
                    <div className="mt-3 p-2 bg-sky-700/60 border border-sky-500 rounded-lg inline-flex items-center text-sky-200 text-sm font-semibold shadow-md">
                        <TicketIcon className="w-5 h-5 mr-2 text-amber-300" /> 
                        {displayedSpinsInfo}
                    </div>
                )}
                {isAuthenticated && user && rouletteResultMessage && !rouletteResultIsWin && !guestJustWonPrizeInfo && !showPostRegistrationGuestWinDisplay && (
                    <div className="mt-3 p-2 bg-sky-700/60 border border-sky-500 rounded-lg inline-flex items-center text-sky-200 text-sm font-semibold shadow-md">
                        <TicketIcon className="w-5 h-5 mr-2 text-amber-300" /> 
                        🎯 Giros restantes: {Math.max(0, user.totalSpinsAvailable - user.spinsUsed)} 
                    </div>
                )}
            </div>


            <button
                onClick={handleRouletteSpin}
                disabled={spinningRoulette || !canSpinRouletteButton}
                className={`px-10 py-5 text-xl sm:text-2xl font-bold rounded-lg shadow-xl transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900
                            ${!canSpinRouletteButton || spinningRoulette ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                                                : (guestJustWonPrizeInfo || showPostRegistrationGuestWinDisplay)
                                                        ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400 animate-pulse' 
                                                        : 'bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 text-white focus:ring-purple-400'}
                            flex items-center justify-center min-w-[300px] sm:min-w-[320px]`}
                aria-live="polite"
            >
                {spinningRoulette ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Girando...
                </>
                ) : (
                <>
                    {(guestJustWonPrizeInfo || showPostRegistrationGuestWinDisplay) ? <CheckIcon className="w-7 h-7 mr-2.5"/> : <SparklesIcon className="w-7 h-7 mr-2.5" />}
                    {rouletteSpinButtonText}
                </>
                )}
            </button>
            {isAuthenticated && !canSpinRouletteButton && infoMessage && 
            !infoMessage.includes(ROULETTE_ALREADY_HAS_DISCOUNT_MESSAGE) && 
            !guestJustWonPrizeInfo && !showPostRegistrationGuestWinDisplay &&
            (rouletteSpinButtonText.toUpperCase().includes("AGUARDE") || rouletteSpinButtonText.toUpperCase().includes("SEM GIROS")) && (
                <button 
                    onClick={() => setPagePhase('dice_prompt')}
                    className="mt-4 text-sm text-sky-300 hover:text-sky-200 hover:underline"
                >
                    Rolar o dado para mais giros
                </button>
            )}
            </div>
        )}
        
        <RouletteRanking winners={rouletteWinners} />

        <div className="mt-12 max-w-xl mx-auto bg-slate-800/70 p-6 rounded-xl shadow-xl border-2 border-slate-700/60">
          <h4 className="text-lg font-semibold text-sky-300 mb-4 text-center flex items-center justify-center">
            <ShieldCheckIcon className="w-6 h-6 mr-2 text-sky-400"/> Regras da Sorte KAIROS:
          </h4>
          <ul className="space-y-3 text-xs">
            {rules.map((rule, index) => {
              const RuleIcon = rule.icon;
              return (
                <li key={index} className="flex items-start p-2.5 bg-slate-700/40 rounded-md border border-slate-600/50 hover:shadow-sm">
                  <RuleIcon className={`w-4 h-4 mr-2.5 mt-0.5 shrink-0 ${rule.iconColor || 'text-sky-400'}`} />
                  <span className="text-slate-300">{rule.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

      </div>
    </section>
  );
};

export default PrizeRoulettePage;