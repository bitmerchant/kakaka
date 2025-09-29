// contexts/PurchaseContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, KAIROS_PACKAGE_ID as KairosPackageIdentifier, AwardedDiscount } from '../types'; 
import { useAuth } from './AuthContext';


interface PurchaseContextType {
  hasPurchasedPackage: (packageId: string) => boolean;
  getPurchaseDateForUser: (userId: string, packageId: string) => number | null;
  recordPurchase: (userId: string, packageId: string, purchaseDate: number, discountUsed?: AwardedDiscount) => void;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

interface UserPurchaseInfo {
  [userId: string]: {
    [packageId: string]: {
      purchaseDate: number;
      discountUsedCode?: string; // Keep code for reference if needed, but rely on AwardedDiscount.id
    };
  };
}

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateCurrentUser, setUserDiscountAsClaimed } = useAuth(); 
  const [userPurchases, setUserPurchases] = useState<UserPurchaseInfo>({});

  useEffect(() => {
    try {
      const storedPurchases = localStorage.getItem('kairosUserPurchases_v1');
      if (storedPurchases) {
        setUserPurchases(JSON.parse(storedPurchases));
      }
    } catch (e) {
      console.error("Failed to parse purchases from localStorage", e);
    }
  }, []);

  const savePurchasesToLocalStorage = (purchases: UserPurchaseInfo) => {
     try {
        localStorage.setItem('kairosUserPurchases_v1', JSON.stringify(purchases));
    } catch (e) {
        console.error("Error saving purchases to localStorage:", e);
    }
  };

  const hasPurchasedPackage = (packageId: string): boolean => {
    if (user && userPurchases[user.id] && userPurchases[user.id][packageId]) {
      return true;
    }
    // Fallback for older user model where isVip might mean package purchase
    if (user && user.isVip && packageId === KairosPackageIdentifier) {
        return true;
    }
    return false;
  };

  const getPurchaseDateForUser = (userId: string, packageId: string): number | null => {
    if (userPurchases[userId] && userPurchases[userId][packageId]) {
      return userPurchases[userId][packageId].purchaseDate;
    }
    // Fallback for older user model
    if (user && user.id === userId && user.isVip && user.purchaseDate && packageId === KairosPackageIdentifier) {
        return user.purchaseDate;
    }
    return null;
  };

  const recordPurchase = (userId: string, packageId: string, purchaseDate: number, discountUsed?: AwardedDiscount) => {
    setUserPurchases(prevPurchases => {
      const updatedPurchases = {
        ...prevPurchases,
        [userId]: {
          ...prevPurchases[userId],
          [packageId]: { purchaseDate, discountUsedCode: discountUsed?.code },
        },
      };
      savePurchasesToLocalStorage(updatedPurchases);
      return updatedPurchases;
    });

    if (packageId === KairosPackageIdentifier && user && user.id === userId && updateCurrentUser) {
      const updatedUserFields: Partial<User> = { 
        isVip: true, 
        purchaseDate: purchaseDate,
      };
      // No need to map awardedDiscounts here, setUserDiscountAsClaimed will handle it in AuthContext
      updateCurrentUser(updatedUserFields);

      if (discountUsed) {
        setUserDiscountAsClaimed(discountUsed.id);
      }
    }
  };


  return (
    <PurchaseContext.Provider value={{ hasPurchasedPackage, getPurchaseDateForUser, recordPurchase }}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchases = () => {
  const context = useContext(PurchaseContext);
  if (context === undefined) {
    throw new Error('usePurchases must be used within a PurchaseProvider');
  }
  return context;
};
