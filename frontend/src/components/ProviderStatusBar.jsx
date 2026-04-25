import React, { useState, useEffect, useCallback } from "react";
import { providerService } from "../services/providerService";

/**
 * ProviderStatusBar
 * Displays a visual chip for each provider in the failover chain.
 * Shows an animated ⚡ FAILOVER badge when the active provider changes.
 *
 * Props:
 *   onProviderChange(name) — optional callback when active provider changes
 */
export default function ProviderStatusBar({ onProviderChange }) {
  const [providers, setProviders]         = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [failoverEnabled, setFailoverEnabled] = useState(false);
  const [showFailoverBadge, setShowFailoverBadge] = useState(false);

  const fetchStatus = useCallback(async () => {
    const data = await providerService.getStatus();
    if (!data) return;

    setProviders(data.providers || []);
    setFailoverEnabled(data.failover_enabled || false);

    const newActive = data.active_provider;
    if (newActive && newActive !== activeProvider && activeProvider !== null) {
      // Provider switched → show failover badge for 6 seconds
      setShowFailoverBadge(true);
      setTimeout(() => setShowFailoverBadge(false), 6000);
    }
    if (newActive !== activeProvider) {
      setActiveProvider(newActive);
      onProviderChange && onProviderChange(newActive);
    }
  }, [activeProvider, onProviderChange]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (providers.length === 0) return null;

  const chipColor = (p) => {
    if (!p.enabled)     return "#4b5563"; // gray  — disabled
    if (!p.has_api_key) return "#d97706"; // amber — no key
    const score = p.health_score ?? 100;
    if (score < 50)     return "#ef4444"; // red   — degraded
    if (p.available)    return "#00E5FF"; // cyan  — active & healthy
    return "#6b7280";                      // gray  — unavailable
  };

  const isActive = (p) => p.name === activeProvider;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {/* Provider chips */}
      {providers.map((p) => (
        <div
          key={p.name}
          title={`${p.display_name} — health: ${p.health_score ?? 100}/100`}
          style={{
            display:       "flex",
            alignItems:    "center",
            gap:           "4px",
            padding:       "2px 8px",
            borderRadius:  "999px",
            border:        `1px solid ${chipColor(p)}40`,
            background:    `${chipColor(p)}15`,
            opacity:       p.enabled ? 1 : 0.5,
            transition:    "all 0.3s ease",
            cursor:        "default",
          }}
        >
          {/* Pulsing dot */}
          <span style={{
            width:        "6px",
            height:       "6px",
            borderRadius: "50%",
            background:   chipColor(p),
            flexShrink:   0,
            animation:    isActive(p) ? "pulse 1.5s infinite" : "none",
          }} />
          <span style={{
            fontSize:      "9px",
            fontWeight:    700,
            letterSpacing: "0.05em",
            color:         chipColor(p),
            whiteSpace:    "nowrap",
            textTransform: "uppercase",
          }}>
            {p.display_name}
          </span>
        </div>
      ))}

      {/* Chain badge */}
      {failoverEnabled && !showFailoverBadge && (
        <span style={{
          fontSize:      "8px",
          fontWeight:    800,
          color:         "#22c55e",
          background:    "#22c55e18",
          border:        "1px solid #22c55e40",
          borderRadius:  "999px",
          padding:       "1px 6px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          ✓ Chain
        </span>
      )}

      {/* Failover badge */}
      {showFailoverBadge && (
        <span style={{
          fontSize:      "9px",
          fontWeight:    800,
          color:         "#f59e0b",
          background:    "#f59e0b18",
          border:        "1px solid #f59e0b60",
          borderRadius:  "999px",
          padding:       "2px 8px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          animation:     "fadeIn 0.3s ease",
        }}>
          ⚡ FAILOVER
        </span>
      )}

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform: scale(1);   }
          50%      { opacity:.5; transform: scale(1.3); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform: scale(0.8); }
          to   { opacity:1; transform: scale(1);   }
        }
      `}</style>
    </div>
  );
}
