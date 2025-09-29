

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import NewsSection from './components/NewsSection'; // Added
import PromptsSection from './components/PromptsSection';
import HowItWorksSection from './components/HowItWorksSection';
import SimulatedAIChatSection from './components/SimulatedAIChatSection'; // Added
import RouletteInfoSection from './components/RouletteInfoSection'; 
import FAQSection from './components/FAQSection';
import TermsSection from './components/TermsSection';
import CallToActionSection from './components/CallToActionSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import PasswordRecoveryModal from './components/PasswordRecoveryModal';
import PurchaseSuccessOverlay from './components/PurchaseSuccessOverlay';
import LivePurchaseNotification from './components/LivePurchaseNotification';
import ChangelogModal from './components/ChangelogModal'; // Added

import PaymentPage from './pages/PaymentPage';
import MyPurchasesPage from './pages/MyPurchasesPage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import LegalDocModal from './components/LegalDocModal'; 
// Changed import path for PrizeRoulettePage
import PrizeRoulettePage from './pages/PrizeRoulettePage';
import VipTransitionPage from './pages/VipTransitionPage'; // Added
import VipChatPage from './pages/VipChatPage';


import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PurchaseProvider, usePurchases } from './contexts/PurchaseContext';

import { ViewState, KAIROS_PACKAGE_ID, PackageDescription, BlogPost as BlogPostType, LegalDocument as LegalDocumentType, AwardedDiscount, UserActivityItem, PackageForPaymentDisplay } from './types';
import { PROMPTS_DATA, KAIROS_PACKAGE_DESCRIPTION, BLOG_POSTS_DATA, LEGAL_DOCUMENTS_DATA, POST_REGISTRATION_GUEST_WIN_NOTIFICATION_TITLE, POST_REGISTRATION_GUEST_WIN_NOTIFICATION_MESSAGE } from './constants';
import { SparklesIcon, TicketIcon, GiftIcon } from './components/Icons';

const smoothScrollTo = (id: string, navbarHeightOffset = true) => {
  const element = document.getElementById(id);
  if (element) {
    let offset = 0;
    if (navbarHeightOffset) {
        const navbar = document.querySelector('nav');
        offset = navbar ? navbar.offsetHeight : 64; 
    }
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  } else if (id === 'hero' || id === '') { 
     window.scrollTo({ top: 0, behavior: 'smooth'});
  }
};


const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('main');
  const [viewParams, setViewParams] = useState<any | null>(null);
  
  const [packageToPurchaseDetails, setPackageToPurchaseDetails] = useState<PackageForPaymentDisplay | null>(null);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPostType | null>(null);
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<LegalDocumentType | null>(null);
  const [isLegalDocModalOpen, setIsLegalDocModalOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false); // Added
  
  const [guestWonPrizeForRegistration, setGuestWonPrizeForRegistration] = useState<AwardedDiscount | null>(null);
  const [justRegisteredAndClaimedGuestPrize, setJustRegisteredAndClaimedGuestPrize] = useState<AwardedDiscount | null>(null);


  const { recordPurchase } = usePurchases();
  const { user, addNotification, isAuthenticated, getActiveDiscount, claimRoulettePrizeForGuest, discountToApplyOnNextPurchase, setDiscountForNextPurchase } = useAuth();
  const authHook = useAuth(); 

  const handleNavigate = useCallback((view: ViewState, params?: any, sectionIdToScroll?: string) => {
    if (currentView === 'payment' && view !== 'payment' && discountToApplyOnNextPurchase) {
        setDiscountForNextPurchase(null);
    }
    
    setCurrentView(view);
    setViewParams(params || null);
    setJustRegisteredAndClaimedGuestPrize(null); // Clear this on any navigation

    if (view === 'blogPost' && params?.slug) {
        const post = BLOG_POSTS_DATA.find(p => p.slug === params.slug);
        setSelectedBlogPost(post || null);
        window.scrollTo({ top: 0, behavior: 'auto' });
    } else if (view === 'legalDoc' && params?.docId) {
        const doc = LEGAL_DOCUMENTS_DATA.find(d => d.id === params.docId);
        setSelectedLegalDoc(doc || null);
        setIsLegalDocModalOpen(true); 
    } else {
        if (sectionIdToScroll) { 
            setTimeout(() => smoothScrollTo(sectionIdToScroll), 0);
        } else if (view === 'main' && params?.scrollTo) { 
            setTimeout(() => smoothScrollTo(params.scrollTo), 0);
        } else if (view !== 'main') { 
            window.scrollTo({ top: 0, behavior: 'auto' }); 
        } else if (view === 'main' && !params?.scrollTo && !isLegalDocModalOpen) { 
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }
  }, [currentView, discountToApplyOnNextPurchase, setDiscountForNextPurchase, isLegalDocModalOpen]);


  const handlePurchasePackage = useCallback((packageDetailsConstant: PackageDescription) => {
    if (!isAuthenticated && !user) {
        authHook.showAuthModal(guestWonPrizeForRegistration ? 'register' : 'login'); 
        return;
    }

    let finalPriceDisplay = packageDetailsConstant.priceDisplay;
    let appliedDiscountInfo: AwardedDiscount | undefined = undefined;
    
    const specificDiscountToUse = discountToApplyOnNextPurchase;

    if (specificDiscountToUse && packageDetailsConstant.originalPrice) {
        const discountAmount = packageDetailsConstant.originalPrice * (specificDiscountToUse.percentage / 100);
        const discountedPrice = packageDetailsConstant.originalPrice - discountAmount;
        finalPriceDisplay = `R$ ${discountedPrice.toFixed(2).replace('.', ',')}`;
        appliedDiscountInfo = specificDiscountToUse;
    } else if (user) { 
        const activeFallbackDiscount = getActiveDiscount(user.id);
        if (activeFallbackDiscount && packageDetailsConstant.originalPrice) {
            const discountAmount = packageDetailsConstant.originalPrice * (activeFallbackDiscount.percentage / 100);
            const discountedPrice = packageDetailsConstant.originalPrice - discountAmount;
            finalPriceDisplay = `R$ ${discountedPrice.toFixed(2).replace('.', ',')}`;
            appliedDiscountInfo = activeFallbackDiscount;
        }
    }
    
    const packageForPayment: PackageForPaymentDisplay = {
        id: KAIROS_PACKAGE_ID, 
        title: packageDetailsConstant.title,
        description: packageDetailsConstant.description,
        accentColor: packageDetailsConstant.accentColor,
        bgColor: packageDetailsConstant.bgColor,
        priceDisplay: finalPriceDisplay,
        benefits: packageDetailsConstant.benefits,
        uniqueSellingPoints: packageDetailsConstant.uniqueSellingPoints,
        targetAudience: packageDetailsConstant.targetAudience,
        originalPrice: packageDetailsConstant.originalPrice, 
        discountApplied: appliedDiscountInfo, 
    };

    setPackageToPurchaseDetails(packageForPayment);
    handleNavigate('payment');
  }, [user, isAuthenticated, discountToApplyOnNextPurchase, getActiveDiscount, handleNavigate, guestWonPrizeForRegistration, authHook]);

  // This effect is now primarily for ensuring the user context is updated after registration
  // The actual "claiming" (adding to user.awardedDiscounts) happens within AuthContext.register
  useEffect(() => {
    if (isAuthenticated && user && guestWonPrizeForRegistration) {
      // Check if the prize is now part of the user's discounts
      const isPrizeInAccount = user.awardedDiscounts.some(d => d.code === guestWonPrizeForRegistration.code);
      if (isPrizeInAccount) {
        // The AuthContext.register has handled adding it.
        // Set state for PrizeRoulettePage to show post-registration message.
        setJustRegisteredAndClaimedGuestPrize(guestWonPrizeForRegistration);
        
        // Optionally, trigger a global notification here if not handled by AuthContext.register
        const notifKey = `guest_win_claimed_${user.id}_${guestWonPrizeForRegistration.id}`;
        if (!user.notifications.find(n => n.uniqueKey === notifKey)) {
            addNotification({
                title: POST_REGISTRATION_GUEST_WIN_NOTIFICATION_TITLE,
                message: POST_REGISTRATION_GUEST_WIN_NOTIFICATION_MESSAGE,
                icon: TicketIcon,
                iconColor: "text-amber-400",
                uniqueKey: notifKey
            });
        }
      }
      setGuestWonPrizeForRegistration(null); // Clear after processing
    }
  }, [isAuthenticated, user, guestWonPrizeForRegistration, addNotification]);


  useEffect(() => {
    if (discountToApplyOnNextPurchase && isAuthenticated && user && currentView !== 'payment') {
        if (!packageToPurchaseDetails || packageToPurchaseDetails.discountApplied?.id !== discountToApplyOnNextPurchase.id) {
            handlePurchasePackage(KAIROS_PACKAGE_DESCRIPTION);
        }
    }
  }, [discountToApplyOnNextPurchase, isAuthenticated, user, currentView, packageToPurchaseDetails, handlePurchasePackage]);


  const handlePaymentSuccess = () => {
    if (user && packageToPurchaseDetails) {
      recordPurchase(user.id, KAIROS_PACKAGE_ID, Date.now(), packageToPurchaseDetails.discountApplied);
      setShowPurchaseSuccess(true); 
      addNotification({ 
          title: "Pacote KAIROS Adquirido!",
          message: `Parabéns, ${user.nickname}! Você desbloqueou o Pacote KAIROS ULTIMATE.`,
          icon: SparklesIcon,
          iconColor: "text-amber-400",
          link: { view: 'myPurchases' },
          uniqueKey: `purchase_${KAIROS_PACKAGE_ID}_${user.id}`
      });
       
      setDiscountForNextPurchase(null); 
    }
  };
  
  const closePurchaseSuccessAndNavigate = () => {
    setShowPurchaseSuccess(false);
    handleNavigate('myPurchases');
  };
  
  const closeLegalDocModal = () => {
    setIsLegalDocModalOpen(false);
    setSelectedLegalDoc(null);
  };

  const initiateKairosPackagePurchase = useCallback(() => {
    handlePurchasePackage(KAIROS_PACKAGE_DESCRIPTION);
  }, [handlePurchasePackage]);


  const renderView = () => {
    switch (currentView) {
      case 'payment':
        if (!packageToPurchaseDetails) {
            setTimeout(() => handleNavigate('main', undefined, 'prompts'), 0);
            return (
                <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center justify-center">
                    <h2 className="text-2xl text-sky-400">Carregando detalhes do pacote...</h2>
                    <SparklesIcon className="w-12 h-12 text-sky-400 animate-pulse my-4" />
                </div>
            );
        }
        return <PaymentPage packageToPurchase={packageToPurchaseDetails} onPaymentSuccess={handlePaymentSuccess} onBack={() => handleNavigate('main', undefined, 'prompts')} />;
      case 'myPurchases':
        return <MyPurchasesPage onNavigate={handleNavigate} />;
      case 'blogList':
        return <BlogListPage posts={BLOG_POSTS_DATA} onNavigate={handleNavigate} />;
      case 'blogPost':
        return selectedBlogPost ? <BlogPostPage post={selectedBlogPost} onNavigate={handleNavigate} /> : <div className="text-center py-10">Artigo não encontrado.</div>;
      case 'roulette':
        return <PrizeRoulettePage 
                    onNavigate={handleNavigate} 
                    guestWonPrizeForRegistration={guestWonPrizeForRegistration} 
                    setGuestWonPrizeForRegistration={setGuestWonPrizeForRegistration}
                    justRegisteredAndClaimedGuestPrize={justRegisteredAndClaimedGuestPrize}
                    setJustRegisteredAndClaimedGuestPrize={setJustRegisteredAndClaimedGuestPrize}
                    onInitiatePurchase={initiateKairosPackagePurchase} 
                />;
      case 'vipTransition':
        return <VipTransitionPage onNavigate={handleNavigate} />;
      case 'vipChat':
        return <VipChatPage onNavigate={handleNavigate} />;
      case 'legalDoc': 
      case 'main':
      default:
        return (
          <>
            <HeroSection />
            <SimulatedAIChatSection />
            <HowItWorksSection />
            <PromptsSection onPurchasePackage={initiateKairosPackagePurchase} />
            <RouletteInfoSection onNavigate={handleNavigate} /> 
            {isAuthenticated && <NewsSection onShowChangelog={() => setIsChangelogModalOpen(true)} />}
            <FAQSection />
            <TermsSection onNavigate={handleNavigate}/>
            <CallToActionSection onPurchasePackage={initiateKairosPackagePurchase} />
          </>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <Navbar onNavigate={handleNavigate} currentView={currentView} />
      <main className="flex-grow">
        {renderView()}
      </main>
      <Footer onNavigate={handleNavigate} />
      <AuthModal /> 
      <UserProfileModal 
        isOpen={authHook.isUserProfileModalOpen} 
        onClose={authHook.hideUserProfileModal}
        onNavigate={handleNavigate}
        onInitiatePurchase={initiateKairosPackagePurchase}
      />
      <PasswordRecoveryModal 
        isOpen={authHook.isPasswordRecoveryModalOpen}
        onClose={authHook.hidePasswordRecoveryModal}
        currentStep={authHook.passwordRecoveryStep}
        setCurrentStep={authHook.setPasswordRecoveryStep}
        nicknameToRecover={authHook.nicknameForRecovery}
        setNicknameToRecover={authHook.setNicknameForRecovery}
      />
      <PurchaseSuccessOverlay isOpen={showPurchaseSuccess} onClose={closePurchaseSuccessAndNavigate} />
      <LivePurchaseNotification />
      {selectedLegalDoc && (
         <LegalDocModal
            isOpen={isLegalDocModalOpen}
            item={selectedLegalDoc}
            onClose={closeLegalDocModal}
          />
      )}
      <ChangelogModal isOpen={isChangelogModalOpen} onClose={() => setIsChangelogModalOpen(false)} />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <PurchaseProvider>
        <AppContent />
      </PurchaseProvider>
    </AuthProvider>
  );
};

export default App;