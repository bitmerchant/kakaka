// types.ts
import React from 'react';

export type ViewState =
  | 'main'
  | 'payment'
  | 'myPurchases'
  | 'blogList'
  | 'blogPost'
  | 'legalDoc'
  | 'roulette'
  | 'vipTransition'
  | 'vipChat';

export interface Prompt {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  priceDisplay: string;
  accentColor: string; // e.g., "text-sky-400"
  bgColor: string; // e.g., "bg-sky-500"
  benefits: string[];
  uniqueSellingPoints: string[];
  targetAudience: string;
  type?: 'base' | 'master' | 'addon';
  fullPrompt?: string;
  version?: number;
  lastUpdated?: number;
  hasUpdate?: boolean;
}

export interface PackageDescription {
  title:string;
  description: string;
  accentColor: string;
  bgColor: string;
  priceDisplay: string; // Initial display price, may be overridden by final calculation
  benefits: string[];
  uniqueSellingPoints: string[];
  targetAudience: string;
  originalPrice?: number; // Base price before any discount
  discountApplied?: AwardedDiscount; // Discount applied to this specific purchase instance
}

export interface PackageForPaymentDisplay extends PackageDescription {
  id: string; // The ID of the package, e.g. KAIROS_PACKAGE_ID
  // priceDisplay here will be the *final* price after discount for display on payment page
}


export type ProfileAvatarId =
  | 'kairosAvatarDefault' // Generic fallback
  | 'kairosAvatarCoupon'
  | 'kairosAvatarRoulette'
  | 'kairosAvatarTrophy'
  | 'kairosAvatarStore'
  | 'kairosAvatarGift';

export const AVAILABLE_PROFILE_AVATARS: Array<{id: ProfileAvatarId; tooltip: string}> = [
  { id: 'kairosAvatarCoupon', tooltip: 'Meu Cupom da Sorte' },
  { id: 'kairosAvatarRoulette', tooltip: 'Roleta de Prêmios' },
  { id: 'kairosAvatarTrophy', tooltip: 'Minhas Conquistas' },
  { id: 'kairosAvatarStore', tooltip: 'Acessar Loja KAIROS' },
  { id: 'kairosAvatarGift', tooltip: 'Prêmios Especiais' },
];

// CyberpunkIconId is no longer needed as RouletteRanking will use actual user avatars.
// export type CyberpunkIconId =
//   | 'cyberProfileIcon1'
//   | 'cyberProfileIcon2'
//   | 'cyberProfileIcon3'
//   | 'cyberProfileIcon4'
//   | 'cyberProfileIcon5';

export interface ThemeSettings {
  accentColor: string; // e.g., '#0ea5e9' for sky, '#d946ef' for fuchsia
  animationSpeed?: 'slow' | 'normal' | 'fast';
  hoverEffect?: 'glow' | 'pulse' | 'subtle';
}

export interface NotificationPrefs {
  popups: boolean;
  sound: boolean;
}

export interface VipHistoryItem {
    id: string;
    action: 'extra_spin_used' | 'special_coupon_claimed' | 'early_access_unlocked';
    description: string;
    timestamp: number;
    icon: React.FC<{ className?: string }>;
}

export interface User {
  id: string;
  nickname: string;
  email?: string; 
  profileIconId: ProfileAvatarId; 
  customProfileImageUrl?: string; 
  isVip: boolean;
  registrationDate: number;
  purchaseDate?: number; // Timestamp of KAIROS_PACKAGE_ID purchase
  lastRouletteSpinTimestamp?: number; 
  lastCouponWinTimestamp?: number; 
  awardedDiscounts: AwardedDiscount[]; 
  notifications: NotificationItem[]; 
  analytics?: UserAnalytics;
  kairosMasteryLevel?: KairosMasteryLevel;
  totalSpinsAvailable: number; 
  spinsUsed: number; 
  lastDiceRollTimestamp?: number; 
  themeSettings?: ThemeSettings;
  notificationPrefs?: NotificationPrefs;
  vipExtraSpinsAvailable?: number;
  vipExtraSpinsUsed?: number;
  vipHistory?: VipHistoryItem[];
}

export interface UserAnalytics {
  bitMerchantActivations: number;
  lastBitMerchantActivation: number | null;
}

export type KairosMasteryLevel = 'Novato KAIROS' | 'Explorador KAIROS' | 'Mestre KAIROS';


export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon?: React.FC<{ className?: string }>;
  iconColor?: string;
  link?: {
    view: ViewState;
    params?: any;
    text?: string;
  };
  uniqueKey?: string; 
}

export interface PurchasedPromptViewModalState {
  isOpen: boolean;
  item: {
    title:string;
    content: string;
    accentColor: string;
    bgColor: string;
  } | null;
  isGuide?: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowItWorksStep {
  id: number;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  iconColor: string;
}

export interface LegalDocument {
    id: 'terms' | 'policy';
    title: string;
    content: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  author: string;
  summary: string;
  content: string; // Full content, potentially markdown or HTML
  imageUrl?: string; 
  icon?: React.FC<{ className?: string }>; 
  iconColor?: string; 
  category?: string;
  tags?: string[];
}

export interface UserActivityItem {
  id: string;
  nicknamePart: string; 
  actionText: string; 
  timestamp: number;
  type: 'purchase' | 'registration' | 'roulette_win';
}

export interface AwardedDiscount {
  id: string; 
  percentage: number;
  expiry: number; // Timestamp
  source: 'roulette' | 'promo_code' | 'manual';
  claimed: boolean;
  code: string; 
  winTimestamp: number; 
}

export interface RouletteSegment {
  id: string;
  text: string; 
  color: 'green' | 'red'; 
  type: 'prize' | 'no_prize';
  prizePercentage?: number; 
  weight: number; 
}

// For guest wins to be added to registration
export interface GuestWinData {
  prizeText: string; // e.g., "10% OFF"
  prizePercentage: number;
  timestamp: number;
}


export interface RouletteWinner {
  id: string;
  nicknamePart: string;
  prize: string; // e.g. "10% OFF"
  timestamp: number;
  profileIconId?: ProfileAvatarId; // Use the standard ProfileAvatarId
  customProfileImageUrl?: string; // Add custom image URL
}

// Types for VIP Chat
export type ChatUserStatus = 'online' | 'away' | 'dnd' | 'offline' | 'stealth';

export interface ChatRole {
  id: string;
  name: string;
  color: string;
}

export interface ChatUser {
  id: string;
  nickname: string;
  avatarUrl?: string;
  profileIconId?: ProfileAvatarId;
  isVip: boolean;
  isAdmin?: boolean;
  status: ChatUserStatus;
  masteryLevel?: KairosMasteryLevel;
  themeColor?: string;
  roleId: string;
  bio?: string;
  registrationDate?: number;
  lastActivityTimestamp?: number;
  isBanned?: boolean;
  isFrozen?: boolean;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
}

export type MessageType = 'user' | 'system' | 'bot';

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  timestamp: number;
  mentions?: string[];
  reactions?: ChatReaction[];
  isPinned?: boolean;
  type: MessageType;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  isLocked?: boolean;
  isPrivate?: boolean;
}

// Constants
export const PIX_CODE_COPIA_COLA = "00020126330014BR.GOV.BCB.PIX0111123456789090005204000053039865802BR5925KAIROS Prompt Hub Compra6009SAO PAULO62070503***6304ABCD";
export const KAIROS_PACKAGE_ID = 'KAIROS_ULTIMATE_PACKAGE_001';
export const KAIROS_REFERRAL_REWARD_AMOUNT = 10; 
export const MASTERY_LEVEL_ACTIVATION_THRESHOLD = 5; 
export const COUPON_EXPIRY_HOURS = 24;