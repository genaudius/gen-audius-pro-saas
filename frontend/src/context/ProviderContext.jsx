import React, { createContext, useContext, useState, useEffect } from "react";
import { PROVIDERS as DEFAULT_PROVIDERS } from "../services/ProviderEngine";

const ProviderContext = createContext({});

export function ProviderProvider({ children }) {
  const [providerState, setProviderState] = useState(() => {
    try {
      const saved = localStorage.getItem("ga_provider_state");
      const parsed = saved ? JSON.parse(saved) : DEFAULT_PROVIDERS;

      // Merge new default providers into existing saved state (so new providers show up in UI).
      const mergeProviders = (currentList = [], defaultList = []) => {
        // Migrations / removals:
        const migrateId = (p) => {
          if (!p) return p;
          // Old SAO provider was renamed to GAU.
          if (p.id === "sao") return { ...p, id: "gau", name: "GenAudius (GAU) Finetune" };
          return p;
        };

        const deprecated = new Set(["sao"]);

        // Normalize saved list (migrate ids, drop deprecated)
        const normalized = (currentList || []).map(migrateId).filter(p => p && !deprecated.has(p.id));
        const savedById = new Map(normalized.map(p => [p.id, p]));

        // Allowlist to DEFAULT_PROVIDERS only (prevents old/unknown duplicates lingering forever)
        const out = [];
        for (const def of defaultList || []) {
          const saved = savedById.get(def.id);
          out.push(saved ? { ...def, ...saved, id: def.id } : def);
        }
        return out;
      };

      const merged = {
        ...DEFAULT_PROVIDERS,
        ...parsed,
        music: mergeProviders(parsed.music, DEFAULT_PROVIDERS.music),
        image: mergeProviders(parsed.image, DEFAULT_PROVIDERS.image),
        video: mergeProviders(parsed.video, DEFAULT_PROVIDERS.video),
        voice: mergeProviders(parsed.voice, DEFAULT_PROVIDERS.voice),
        lyrics: mergeProviders(parsed.lyrics, DEFAULT_PROVIDERS.lyrics),
      };

      // Basic sanity: if MODAL is missing, reset (stale cache/corruption)
      const hasModal = merged.music?.some(p => p.id === "MODAL");
      if (!hasModal) {
        console.warn("Migration: MODAL provider missing. Resetting provider state.");
        return DEFAULT_PROVIDERS;
      }
      return merged;
    } catch (e) {
      console.error("Provider state corruption detected, resetting to defaults.");
      return DEFAULT_PROVIDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem("ga_provider_state", JSON.stringify(providerState));
  }, [providerState]);

  return (
    <ProviderContext.Provider value={{ providerState, setProviderState }}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProviders() {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error("useProviders must be used within a ProviderProvider");
  }
  return context;
}
