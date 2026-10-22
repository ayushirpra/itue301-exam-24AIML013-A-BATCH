import { createContext, useContext, useState, useCallback } from 'react';
import { apiRequest } from '../api';

/**
 * AuthContext exposes { customer, token, login, logout, isAuthenticated }.
 * The token and customer are persisted to localStorage so a refresh keeps
 * the user logged in.
 */
const AuthContext = createContext(null);

const TOKEN_KEY = 'driveeasy_token';
const CUSTOMER_KEY = 'driveeasy_customer';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [customer, setCustomer] = useState(() => {
    const saved = localStorage.getItem(CUSTOMER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    const newToken = data.token;
    const newCustomer = data.customer;

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(newCustomer));

    setToken(newToken);
    setCustomer(newCustomer);

    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    setToken(null);
    setCustomer(null);
  }, []);

  const value = {
    customer,
    token,
    login,
    logout,
    isAuthenticated: Boolean(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume the AuthContext.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
