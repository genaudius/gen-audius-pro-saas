import React, { createContext, useContext, useState, useEffect } from "react";

const ApiKeysContext = createContext({});

export function ApiKeysProvider({ children }) {
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem("ga_api_keys");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("ga_api_keys", JSON.stringify(apiKeys));
  }, [apiKeys]);

  return (
    <ApiKeysContext.Provider value={{ apiKeys, setApiKeys }}>
      {children}
    </ApiKeysContext.Provider>
  );
}

export function useApiKeys() {
  const context = useContext(ApiKeysContext);
  if (!context) {
    throw new Error("useApiKeys must be used within an ApiKeysProvider");
  }
  return context;
}
