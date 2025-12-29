import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check session storage on mount
    const storedAuth = sessionStorage.getItem('kinship_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username, password) => {
    // Hardcoded credentials for "simple" authentication
    const VALID_USER = 'admin';
    const VALID_PASS = import.meta.env.VITE_USER_PASSWORD;

    if (username === VALID_USER && password === VALID_PASS) {
      setIsAuthenticated(true);
      sessionStorage.setItem('kinship_auth', 'true');
      return { success: true };
    } else {
      return { success: false, message: 'Invalid credentials' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kinship_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
