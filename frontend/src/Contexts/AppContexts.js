import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang');
    return saved || "en";
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('isLoggedIn');
    return saved ? JSON.parse(saved) : false;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleLanguage = () => {
    setLang(prev => {
      const newValue = prev === "en" ? "bn" : "en";
      localStorage.setItem('lang', newValue);
      return newValue;
    });
  };

  const login = (userData) => {
    console.log('Logging in with:', userData);
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('isLoggedIn', JSON.stringify(true));
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('Logging out');
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  };

  const value = {
    darkMode,
    toggleDarkMode,
    lang,
    toggleLanguage,
    isLoggedIn,
    user,
    login,
    logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}