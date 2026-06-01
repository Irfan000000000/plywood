import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const POSContext = createContext(null);

export function POSProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const handlersRef = useRef({});

  const registerHandlers = useCallback((handlers) => {
    handlersRef.current = handlers;
  }, []);

  const openSection = useCallback((name) => {
    handlersRef.current.openSection?.(name);
  }, []);

  const openCheckout = useCallback(() => {
    handlersRef.current.openCheckout?.();
  }, []);

  const updateCartCount = useCallback((count) => {
    setCartCount(count);
  }, []);

  return (
    <POSContext.Provider value={{ registerHandlers, openSection, openCheckout, cartCount, updateCartCount }}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  return useContext(POSContext);
}
