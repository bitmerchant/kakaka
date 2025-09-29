// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, ViewState, NotificationItem, UserActivityItem, AwardedDiscount, ProfileAvatarId, UserAnalytics, KairosMasteryLevel, KAIROS_PACKAGE_ID, AVAILABLE_PROFILE_AVATARS, MASTERY_LEVEL_ACTIVATION_THRESHOLD, RouletteSegment, COUPON_EXPIRY_HOURS, GuestWinData, RouletteWinner, ThemeSettings, NotificationPrefs, VipHistoryItem } from '../types';
import { PROMPTS_DATA, ROULETTE_PRIZES_CONFIG, ROULETTE_SPIN_COOLDOWN_HOURS, POST_REGISTRATION_GUEST_WIN_NOTIFICATION_TITLE, POST_REGISTRATION_GUEST_WIN_NOTIFICATION_MESSAGE, WELCOME_COUPON_NOTIFICATION_TITLE, WELCOME_COUPON_NOTIFICATION_MESSAGE, THEME_COLORS } from '../constants'; // For notifications related to updates
import { BoltIcon, SparklesIcon, TicketIcon, GiftIcon } from '../components/Icons'; 

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (nickname: string, password?: string) => Promise<{success: boolean; error?: string}>; 
  register: (userData: { nickname: string; securityCode: string; password?: string; email?: string }, guestInitialSpins?: number, guestSpinsUsed?: number) => Promise<{success: boolean; error?: string, claimedGuestPrize?: AwardedDiscount | null}>;
  logout: () => void;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register';
  showAuthModal: (view: 'login' | 'register') => void;
  hideAuthModal: () => void;
  
  isUserProfileModalOpen: boolean;
  showUserProfileModal: () => void;
  hideUserProfileModal: () => void;

  isPasswordRecoveryModalOpen: boolean;
  passwordRecoveryStep: 'request' | 'reset';
  nicknameForRecovery: string | null;
  showPasswordRecoveryModal: () => void;
  hidePasswordRecoveryModal: () => void;
  setPasswordRecoveryStep: (step: 'request' | 'reset') => void;
  setNicknameForRecovery: (nickname: string | null) => void;

  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  userActivity: UserActivityItem[]; 
  
  updateUserProfileAvatar: (userId: string, iconId: ProfileAvatarId | null, customImageUrl: string | null) => Promise<boolean>;
  updateUserAnalytics: (userId: string, analytics: UserAnalytics) => Promise<boolean>;
  updateUserMasteryLevel: (userId: string, level: KairosMasteryLevel) => Promise<boolean>;
  updateCurrentUser: (updatedUserData: Partial<User>) => void; 
  
  spinRoulette: () => Promise<{ prizeSegment: RouletteSegment | null; error?: string; message?: string }>;
  getRouletteWinners: () => RouletteWinner[];
  addRouletteWinner: (winner: Omit<RouletteWinner, 'id'>) => void;
  claimRoulettePrizeForGuest: (prize: AwardedDiscount) => AwardedDiscount | null; // Returns claimed prize or null
  getActiveDiscount: (userId: string) => AwardedDiscount | null; 
  
  discountToApplyOnNextPurchase: AwardedDiscount | null;
  setDiscountForNextPurchase: (discount: AwardedDiscount | null) => void;
  setUserDiscountAsClaimed: (discountId: string) => void;

  updateSpinsFromDiceRoll: (newTotalSpins: number) => void;
  updateUserSettings: (settings: { themeSettings?: Partial<ThemeSettings>; notificationPrefs?: Partial<NotificationPrefs> }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeLocalStorageGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`AuthContext: Failed to access localStorage getItem for key "${key}":`, e);
    return null;
  }
};

const safeLocalStorageRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`AuthContext: Failed to access localStorage removeItem for key "${key}":`, e);
  }
};

const safeSessionStorageGetItem = (key: string): string | null => {
    try {
        return sessionStorage.getItem(key);
    } catch (e) {
        console.warn(`AuthContext: Failed to access sessionStorage getItem for key "${key}":`, e);
        return null;
    }
};

const safeSessionStorageRemoveItem = (key: string): void => {
    try {
        sessionStorage.removeItem(key);
    } catch (e) {
        console.warn(`AuthContext: Failed to access sessionStorage removeItem for key "${key}":`, e);
    }
};

const initializeUserFields = (user: any): User => {
    return {
        ...user,
        notifications: user.notifications || [],
        totalSpinsAvailable: typeof user.totalSpinsAvailable === 'undefined' ? 0 : user.totalSpinsAvailable,
        spinsUsed: typeof user.spinsUsed === 'undefined' ? 0 : user.spinsUsed,
        awardedDiscounts: (user.awardedDiscounts || []).map((d: AwardedDiscount) => ({ ...d, claimed: d.claimed || false })),
        lastCouponWinTimestamp: typeof user.lastCouponWinTimestamp === 'undefined' ? undefined : user.lastCouponWinTimestamp,
        profileIconId: user.profileIconId || AVAILABLE_PROFILE_AVATARS[0].id,
        customProfileImageUrl: user.customProfileImageUrl || undefined,
        themeSettings: {
            accentColor: user.themeSettings?.accentColor || THEME_COLORS[0].value,
            animationSpeed: user.themeSettings?.animationSpeed || 'normal',
            hoverEffect: user.themeSettings?.hoverEffect || 'glow',
        },
        notificationPrefs: {
            popups: user.notificationPrefs?.popups ?? true,
            sound: user.notificationPrefs?.sound ?? true,
        },
        vipExtraSpinsAvailable: user.vipExtraSpinsAvailable || 0,
        vipExtraSpinsUsed: user.vipExtraSpinsUsed || 0,
        vipHistory: user.vipHistory || [],
    };
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [isPasswordRecoveryModalOpen, setIsPasswordRecoveryModalOpen] = useState(false);
  const [passwordRecoveryStep, setPasswordRecoveryStep] = useState<'request' | 'reset'>('request');
  const [nicknameForRecovery, setNicknameForRecovery] = useState<string | null>(null);

  const [userActivity, setUserActivity] = useState<UserActivityItem[]>([]);
  const [rouletteWinners, setRouletteWinners] = useState<RouletteWinner[]>([]);
  const [discountToApplyOnNextPurchase, setDiscountToApplyOnNextPurchase] = useState<AwardedDiscount | null>(null);


  useEffect(() => {
    try {
      const storedUser = safeLocalStorageGetItem('kairosUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const initializedUser = initializeUserFields(parsedUser);
        setUser(initializedUser);
        setIsAuthenticated(true);
      }
      const storedWinners = safeLocalStorageGetItem('kairosRouletteWinners_v1');
      if (storedWinners) {
        setRouletteWinners(JSON.parse(storedWinners));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      safeLocalStorageRemoveItem('kairosUser');
    }
  }, []);

  const saveUserToLocalStorage = (currentUser: User | null) => {
    try {
        if (currentUser) {
            localStorage.setItem('kairosUser', JSON.stringify(currentUser));
            const storedUsersRaw = safeLocalStorageGetItem('kairosRegisteredUsers');
            const storedUsers = JSON.parse(storedUsersRaw || '[]') as User[]; 
            const userIndex = storedUsers.findIndex(u => u.id === currentUser.id);
            if (userIndex > -1) {
                storedUsers[userIndex] = currentUser;
            } else {
                storedUsers.push(currentUser);
            }
            localStorage.setItem('kairosRegisteredUsers', JSON.stringify(storedUsers));
        } else {
            safeLocalStorageRemoveItem('kairosUser');
        }
    } catch (e) {
        console.error("Error saving user to localStorage:", e);
    }
  };

  const updateCurrentUser = (updatedUserData: Partial<User>) => {
    setUser(prevUser => {
      if (prevUser) {
        const newUser = { ...prevUser, ...updatedUserData };
        saveUserToLocalStorage(newUser);
        return newUser;
      }
      return prevUser; 
    });
  };


  const login = async (nickname: string, password?: string): Promise<{success: boolean; error?: string}> => {
    return new Promise((resolve) => {
        const storedUsersRaw = safeLocalStorageGetItem('kairosRegisteredUsers');
        const storedUsers = JSON.parse(storedUsersRaw || '[]');
        let foundUser = storedUsers.find((u: any) => u.nickname === nickname && (u as any).password === password); 

        if (foundUser) {
          const initializedUser = initializeUserFields(foundUser);
          setUser(initializedUser);
          setIsAuthenticated(true);
          saveUserToLocalStorage(initializedUser);
          
          PROMPTS_DATA.forEach(p => {
              if (p.hasUpdate && p.version && p.lastUpdated && initializedUser.isVip) { 
                  addNotification({
                      title: `Nova Versão Disponível: ${p.title}`,
                      message: `A versão ${(p.version || 0) +1}.0 do prompt {{promptName}} foi lançada! Confira as novidades.`,
                      icon: SparklesIcon,
                      iconColor: "text-yellow-400",
                      link: { view: 'myPurchases', params: { promptName: p.title, version: (p.version || 0)+1 } },
                      uniqueKey: `update_${p.id}_v${(p.version || 0) + 1}_user${initializedUser.id}`
                  });
              }
          });
          resolve({ success: true });
        } else {
          resolve({ success: false, error: "Credenciais inválidas ou usuário não encontrado." });
        }
    });
  };

  const register = async (
    userData: { nickname: string; securityCode: string; password?: string; email?: string },
    guestInitialSpins: number = 0,
    guestSpinsUsedBeforeRegister: number = 0
  ): Promise<{success: boolean; error?: string; claimedGuestPrize?: AwardedDiscount | null}> => {
    return new Promise((resolve) => {
        const storedUsersRaw = safeLocalStorageGetItem('kairosRegisteredUsers');
        let storedUsers: User[] = JSON.parse(storedUsersRaw || '[]');
        if (storedUsers.find(u => u.nickname === userData.nickname)) {
          resolve({ success: false, error: 'Nickname já registrado. Por favor, escolha outro.' });
          return;
        }
        
        const guestLostSpinRaw = safeLocalStorageGetItem('kairosGuestLostSpin_v1');
        let initialSpins = guestInitialSpins;
        let spinsUsed = guestSpinsUsedBeforeRegister;

        if (initialSpins === 0 && guestLostSpinRaw === 'true') {
            initialSpins = 0; 
            spinsUsed = 0;
            safeLocalStorageRemoveItem('kairosGuestLostSpin_v1'); 
        } else if (initialSpins === 0 && guestLostSpinRaw !== 'true') {
            initialSpins = 0; 
            spinsUsed = 0;
        }

        const guestWonRoulettePrizeRaw = safeSessionStorageGetItem('kairosGuestWonRoulettePrize_v1');
        let guestCouponsToAdd: AwardedDiscount[] = [];
        let claimedGuestPrizeResult: AwardedDiscount | null = null;
        
        if (guestWonRoulettePrizeRaw) {
            try {
                const guestWinData: GuestWinData = JSON.parse(guestWonRoulettePrizeRaw);
                const winTimestamp = guestWinData.timestamp;
                const newDiscount: AwardedDiscount = {
                    id: `KRS_ROUL_GUEST_${userData.nickname.slice(0,4)}_${winTimestamp}`,
                    percentage: guestWinData.prizePercentage,
                    expiry: winTimestamp + (COUPON_EXPIRY_HOURS * 60 * 60 * 1000),
                    source: 'roulette',
                    claimed: false, 
                    code: `ROUL${guestWinData.prizePercentage}-${winTimestamp.toString().slice(-5)}`,
                    winTimestamp: winTimestamp,
                };
                guestCouponsToAdd.push(newDiscount);
                claimedGuestPrizeResult = newDiscount;
            } catch (e) {
                console.error("Failed to parse guest roulette prize from sessionStorage", e);
            }
        }


        const rawNewUser: Omit<User, keyof ReturnType<typeof initializeUserFields>> & Partial<User> = {
          id: `user_${Date.now()}`,
          nickname: userData.nickname,
          email: userData.email,
          profileIconId: AVAILABLE_PROFILE_AVATARS[0].id, 
          isVip: false,
          registrationDate: Date.now(),
          awardedDiscounts: guestCouponsToAdd,
          analytics: { bitMerchantActivations: 0, lastBitMerchantActivation: null },
          kairosMasteryLevel: 'Novato KAIROS',
          totalSpinsAvailable: initialSpins,
          spinsUsed: spinsUsed,
          ...(userData.password && { password: userData.password }), 
          ...(userData.securityCode && { securityCode: userData.securityCode }) 
        };
        const newUser = initializeUserFields(rawNewUser);
        
        const deviceLastCouponWinTimestampRaw = safeLocalStorageGetItem('kairosDeviceLastCouponWinTimestamp_v1');
        if (deviceLastCouponWinTimestampRaw) {
            const deviceWinTime = parseInt(deviceLastCouponWinTimestampRaw, 10);
            if (Date.now() - deviceWinTime < 24 * 60 * 60 * 1000) {
                newUser.lastCouponWinTimestamp = deviceWinTime;
            }
        }
        
        storedUsers.push(newUser);
        localStorage.setItem('kairosRegisteredUsers', JSON.stringify(storedUsers));
        
        setUser(newUser); 
        setIsAuthenticated(true);
        saveUserToLocalStorage(newUser);
        
        if (claimedGuestPrizeResult) {
            addNotification({
                title: POST_REGISTRATION_GUEST_WIN_NOTIFICATION_TITLE,
                message: POST_REGISTRATION_GUEST_WIN_NOTIFICATION_MESSAGE,
                icon: TicketIcon,
                iconColor: "text-amber-400",
                uniqueKey: `guest_win_claimed_${newUser.id}_${claimedGuestPrizeResult.id}`
            });
        } else {
             addNotification({ 
                title: "Bem-vindo ao KAIROS Hub!",
                message: `Sua conta foi criada com sucesso, ${newUser.nickname}. Role o dado na Roleta KAIROS para ganhar giros!`,
                icon: BoltIcon,
                iconColor: "text-sky-400",
                uniqueKey: `welcome_${newUser.id}`
            });
        }

        if (guestWonRoulettePrizeRaw) {
            try {
                const guestWinData: GuestWinData = JSON.parse(guestWonRoulettePrizeRaw);
                 addRouletteWinner({ // Pass the new user's actual avatar info
                    nicknamePart: `${newUser.nickname.substring(0,6)}...`,
                    prize: guestWinData.prizeText,
                    timestamp: guestWinData.timestamp,
                    profileIconId: newUser.profileIconId,
                    customProfileImageUrl: newUser.customProfileImageUrl
                });
            } catch (e) { console.error("Error processing guest win for ranking:", e); }
            safeSessionStorageRemoveItem('kairosGuestWonRoulettePrize_v1');
        }
        
        const newActivity: UserActivityItem = {
            id: `act_reg_${Date.now()}`, 
            nicknamePart: `${newUser.nickname.substring(0,5)}...`,
            actionText: "acabou de se registrar no KAIROS Hub!",
            timestamp: Date.now(),
            type: 'registration',
        };
        setUserActivity(prev => [newActivity, ...prev.slice(0, 4)]); 
        resolve({ success: true, claimedGuestPrize: claimedGuestPrizeResult });
    });
  };

  const logout = () => {
    setUser(null); 
    setIsAuthenticated(false);
    saveUserToLocalStorage(null); 
    setDiscountToApplyOnNextPurchase(null); 
    safeSessionStorageRemoveItem('kairosGuestDiceSpins');
    safeSessionStorageRemoveItem('kairosGuestDiceSpinsUsed');
    safeSessionStorageRemoveItem('kairosGuestRolledDice_v1');
    safeSessionStorageRemoveItem('kairosGuestWonRoulettePrize_v1');
  };
  
  const showAuthModal = (view: 'login' | 'register') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
    hidePasswordRecoveryModal(); 
    hideUserProfileModal(); 
  };
  const hideAuthModal = () => setIsAuthModalOpen(false);

  const showUserProfileModal = () => {
    if (isAuthenticated && user) {
      setIsUserProfileModalOpen(true);
      hideAuthModal(); 
    }
  };
  const hideUserProfileModal = () => setIsUserProfileModalOpen(false);
  
  const showPasswordRecoveryModal = () => {
    setPasswordRecoveryStep('request'); 
    setNicknameForRecovery(null);
    setIsPasswordRecoveryModalOpen(true);
    hideAuthModal(); 
  };
  const hidePasswordRecoveryModal = () => {
      setIsPasswordRecoveryModalOpen(false);
      setPasswordRecoveryStep('request'); 
      setNicknameForRecovery(null); 
  };

  const addNotification = useCallback((notificationData: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    setUser(prevUser => {
        if (!prevUser) return prevUser; 

        const newNotification: NotificationItem = {
            ...notificationData,
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            timestamp: Date.now(),
            read: false,
        };

        if (notificationData.uniqueKey && prevUser.notifications.some(n => n.uniqueKey === notificationData.uniqueKey)) {
            return prevUser; 
        }
        
        const updatedUser = {
          ...prevUser,
          notifications: [newNotification, ...prevUser.notifications]
        };
        saveUserToLocalStorage(updatedUser);
        return updatedUser;
    });
  }, []);

  const markNotificationAsRead = (id: string) => {
    setUser(prevUser => {
        if (!prevUser) return prevUser;
        const updatedNotifications = prevUser.notifications.map(n => n.id === id ? { ...n, read: true } : n);
        const updatedUser = { ...prevUser, notifications: updatedNotifications };
        saveUserToLocalStorage(updatedUser);
        return updatedUser;
    });
  };

  const markAllNotificationsAsRead = () => {
    setUser(prevUser => {
        if (!prevUser) return prevUser;
        const updatedNotifications = prevUser.notifications.map(n => ({ ...n, read: true }));
        const updatedUser = { ...prevUser, notifications: updatedNotifications };
        saveUserToLocalStorage(updatedUser);
        return updatedUser;
    });
  };

  const updateUserProfileAvatar = async (userId: string, iconId: ProfileAvatarId | null, customImageUrl: string | null): Promise<boolean> => {
    if (user && user.id === userId) {
      if (customImageUrl) {
        updateCurrentUser({ profileIconId: iconId || AVAILABLE_PROFILE_AVATARS[0].id, customProfileImageUrl: customImageUrl });
      } else if (iconId) {
        updateCurrentUser({ profileIconId: iconId, customProfileImageUrl: undefined });
      }
      return true;
    }
    return false;
  };
  
  const updateUserAnalytics = async (userId: string, analytics: UserAnalytics): Promise<boolean> => {
    if (user && user.id === userId) {
      updateCurrentUser({ analytics });
      return true;
    }
    return false;
  };

  const updateUserMasteryLevel = async (userId: string, level: KairosMasteryLevel): Promise<boolean> => {
    if (user && user.id === userId) {
      updateCurrentUser({ kairosMasteryLevel: level });
      return true;
    }
    return false;
  };

  const updateSpinsFromDiceRoll = (newTotalSpins: number) => {
    if (user && isAuthenticated) {
        updateCurrentUser({
            totalSpinsAvailable: newTotalSpins,
            spinsUsed: 0, 
            lastDiceRollTimestamp: Date.now() 
        });
    }
  };

  const updateUserSettings = (settings: { themeSettings?: Partial<ThemeSettings>; notificationPrefs?: Partial<NotificationPrefs> }) => {
    setUser(prevUser => {
        if (!prevUser) return null;

        const newUser: User = {
            ...prevUser,
            themeSettings: {
                ...(prevUser.themeSettings || {}),
                ...settings.themeSettings
            } as ThemeSettings,
            notificationPrefs: {
                ...(prevUser.notificationPrefs || {popups: true, sound: true}),
                ...settings.notificationPrefs
            } as NotificationPrefs
        };
        
        saveUserToLocalStorage(newUser);
        return newUser;
    });
  };

  const spinRoulette = async (): Promise<{ prizeSegment: RouletteSegment | null; error?: string; message?: string }> => {
    // setTimeout removed to make the spin feel more immediate.
    // The result display is controlled by the animation timer in PrizeRoulettePage.tsx.

    // Check for available spins
    if (isAuthenticated && user) {
      if (user.spinsUsed >= user.totalSpinsAvailable) {
        return { prizeSegment: null, error: "Você não tem giros da roleta. Role o dado para obter mais!" };
      }
    } else { // Guest user
        const guestSpinsRaw = safeSessionStorageGetItem('kairosGuestDiceSpins');
        const guestUsedSpinsRaw = safeSessionStorageGetItem('kairosGuestDiceSpinsUsed');
        const guestSpins = guestSpinsRaw ? parseInt(guestSpinsRaw, 10) : 0;
        const guestUsedSpins = guestUsedSpinsRaw ? parseInt(guestUsedSpinsRaw, 10) : 0;

        if(guestUsedSpins >= guestSpins) {
             return { prizeSegment: null, error: "Você utilizou seu giro de visitante. Registre-se para mais!" };
        }
    }

    // New logic for 80/20 win/loss probability
    const isWin = Math.random() < 0.8;

    const prizeSegments = ROULETTE_PRIZES_CONFIG.filter(s => s.type === 'prize');
    const lossSegments = ROULETTE_PRIZES_CONFIG.filter(s => s.type === 'no_prize');

    let chosenSegment: RouletteSegment | null = null;

    if (isWin && prizeSegments.length > 0) {
        chosenSegment = prizeSegments[Math.floor(Math.random() * prizeSegments.length)];
    } else if (!isWin && lossSegments.length > 0) {
        chosenSegment = lossSegments[Math.floor(Math.random() * lossSegments.length)];
    } else {
        // Fallback if no segments of the chosen type are configured (e.g., only prize segments exist and user loses)
        // Or if all segments are prizes and user wins, this logic still works.
        // We'll give a random segment to avoid errors.
        if (lossSegments.length > 0 && !isWin) { // If there are loss segments and it was a loss, pick one
             chosenSegment = lossSegments[Math.floor(Math.random() * lossSegments.length)];
        } else if (prizeSegments.length > 0) { // Otherwise, try to pick a prize segment
             chosenSegment = prizeSegments[Math.floor(Math.random() * prizeSegments.length)];
        } else {
            // Absolute fallback
            chosenSegment = ROULETTE_PRIZES_CONFIG[Math.floor(Math.random() * ROULETTE_PRIZES_CONFIG.length)];
        }
    }

    const winTimestamp = Date.now();
    if (isAuthenticated && user) {
      const updatedUserData: Partial<User> = {
          lastRouletteSpinTimestamp: winTimestamp,
          spinsUsed: user.spinsUsed + 1
      };

      if (chosenSegment.type === 'prize' && chosenSegment.prizePercentage) {
        const discountId = `KRS_ROUL_${user.id.slice(-4)}_${winTimestamp}`;
        const newDiscount: AwardedDiscount = {
          id: discountId,
          percentage: chosenSegment.prizePercentage,
          expiry: winTimestamp + (COUPON_EXPIRY_HOURS * 60 * 60 * 1000),
          source: 'roulette',
          claimed: false,
          code: `ROUL${chosenSegment.prizePercentage}-${winTimestamp.toString().slice(-5)}`,
          winTimestamp: winTimestamp,
        };
        updatedUserData.awardedDiscounts = [...(user.awardedDiscounts || []), newDiscount];
        updatedUserData.lastCouponWinTimestamp = winTimestamp;
        safeLocalStorageSetItem('kairosDeviceLastCouponWinTimestamp_v1', winTimestamp.toString());

        addNotification({
            title: "Prêmio da Roleta Ganhado!",
            message: `Você ganhou ${chosenSegment.prizePercentage}% de desconto! Use em até ${COUPON_EXPIRY_HOURS} horas.`,
            icon: TicketIcon,
            iconColor: "text-amber-400",
            link: { view: 'roulette' },
            uniqueKey: `roulette_win_${user.id}_${newDiscount.id}`
        });
      }
      updateCurrentUser(updatedUserData);
    } else {
        const guestUsedSpinsRaw = safeSessionStorageGetItem('kairosGuestDiceSpinsUsed');
        const guestUsedSpins = guestUsedSpinsRaw ? parseInt(guestUsedSpinsRaw, 10) : 0;
        safeSessionStorageSetItem('kairosGuestDiceSpinsUsed', (guestUsedSpins + 1).toString());

        if (chosenSegment.type === 'prize' && chosenSegment.prizePercentage) {
            safeLocalStorageSetItem('kairosDeviceLastCouponWinTimestamp_v1', winTimestamp.toString());
        } else {
            safeLocalStorageSetItem('kairosGuestLostSpin_v1', 'true');
        }
    }
    return { prizeSegment: chosenSegment, message: chosenSegment.text };
  };

  const getRouletteWinners = (): RouletteWinner[] => {
    return rouletteWinners.sort((a, b) => b.timestamp - a.timestamp);
  };

  const addRouletteWinner = (winnerData: Omit<RouletteWinner, 'id'>) => {
    const newWinner: RouletteWinner = {
        ...winnerData, // This now includes profileIconId and customProfileImageUrl
        id: `rw_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
    };
    setRouletteWinners(prev => {
        const updatedWinners = [newWinner, ...prev.slice(0, 9)]; 
        localStorage.setItem('kairosRouletteWinners_v1', JSON.stringify(updatedWinners));
        return updatedWinners;
    });
  };

  const claimRoulettePrizeForGuest = (prize: AwardedDiscount): AwardedDiscount | null => {
     if (user && isAuthenticated) { 
        const prizeExists = user.awardedDiscounts?.some(d => d.code === prize.code); 
        
        if (!prizeExists) {
            const updatedDiscounts = [...(user.awardedDiscounts || []), prize];
            updateCurrentUser({ awardedDiscounts: updatedDiscounts });
            return prize;
        }
        return user.awardedDiscounts.find(d => d.code === prize.code) || prize;
     }
     return null;
  };

  const getActiveDiscount = (userId: string): AwardedDiscount | null => {
    if (user && user.id === userId && user.awardedDiscounts) {
        const sortedDiscounts = user.awardedDiscounts
            .filter(d => !d.claimed && d.expiry > Date.now())
            .sort((a,b) => b.winTimestamp - a.winTimestamp); 
        return sortedDiscounts.length > 0 ? sortedDiscounts[0] : null;
    }
    return null;
  };

  const setUserDiscountAsClaimed = (discountId: string) => {
    if (user && user.awardedDiscounts) {
      const updatedDiscounts = user.awardedDiscounts.map(d => 
        d.id === discountId ? { ...d, claimed: true } : d
      );
      updateCurrentUser({ awardedDiscounts: updatedDiscounts });
    }
  };

  const setDiscountForNextPurchase = (discount: AwardedDiscount | null) => {
    setDiscountToApplyOnNextPurchase(discount);
  };

  const safeLocalStorageSetItem = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn(`AuthContext: Failed to access localStorage setItem for key "${key}":`, e);
    }
  };
  const safeSessionStorageSetItem = (key: string, value: string) => {
    try {
        sessionStorage.setItem(key, value);
    } catch (e) {
        console.warn(`AuthContext: Failed to access sessionStorage setItem for key "${key}":`, e);
    }
  };


  return (
    <AuthContext.Provider value={{ 
        isAuthenticated, user, login, register, logout, 
        isAuthModalOpen, authModalView, showAuthModal, hideAuthModal,
        isUserProfileModalOpen, showUserProfileModal, hideUserProfileModal,
        isPasswordRecoveryModalOpen, passwordRecoveryStep, nicknameForRecovery,
        showPasswordRecoveryModal, hidePasswordRecoveryModal, setPasswordRecoveryStep, setNicknameForRecovery,
        addNotification, markNotificationAsRead, markAllNotificationsAsRead,
        userActivity, 
        updateUserProfileAvatar, updateUserAnalytics, updateUserMasteryLevel, updateCurrentUser,
        spinRoulette, getRouletteWinners, addRouletteWinner, claimRoulettePrizeForGuest, getActiveDiscount,
        discountToApplyOnNextPurchase, setDiscountForNextPurchase, setUserDiscountAsClaimed,
        updateSpinsFromDiceRoll,
        updateUserSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};