import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDatabase } from './DatabaseContext';

export const WalletContext = createContext({});

export function WalletProvider({ children }) {
  const { userWallet } = useDatabase();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Sync current user from local storage (set during login)
    const checkUser = () => {
      const userId = localStorage.getItem('ga_user_id');
      if (userId) {
        setUser({
          userId,
          username: localStorage.getItem('ga_username') || userId,
          plan: localStorage.getItem('ga_plan') || 'free',
          email: localStorage.getItem('ga_email') || ''
        });
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    
    // Custom event for when session is cleared or set inside App.js without triggering 'storage'
    window.addEventListener('ga_auth_change', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('ga_auth_change', checkUser);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ 
      credits: userWallet?.credits || 0, 
      balance: userWallet?.balance || 0, 
      user 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
