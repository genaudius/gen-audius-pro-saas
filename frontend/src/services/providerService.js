/**
 * Gen Audius Pro — Provider Service
 * Communicates with the backend's provider management endpoints.
 */

// In dev, all backend calls should go through the Vite proxy (`/api/backend`)
// so we don't fight ports (backend runs on :8005).
const API_BASE = import.meta.env.VITE_API_URL || "/api/backend";

export const providerService = {
  /**
   * Get full provider stack status.
   * @returns { providers, active_provider, active_chain, failover_enabled }
   */
  async getStatus() {
    try {
      const res = await fetch(`${API_BASE}/api/providers/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("[ProviderService] Could not fetch status:", err.message);
      return null;
    }
  },

  /**
   * Toggle a provider on or off.
   * @param {string} name  Provider name (e.g. "MUREKA")
   * @param {boolean} enabled
   */
  async toggle(name, enabled) {
    const res = await fetch(`${API_BASE}/api/providers/${name}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    return res.json();
  },

  /**
   * Reload provider configs from YAML files (hot-reload).
   */
  async reload() {
    const res = await fetch(`${API_BASE}/api/providers/reload`, { method: "POST" });
    return res.json();
  },

  /**
   * Fetch the failover event log (admin only).
   * @param {number} limit
   */
  async getFailoverLog(limit = 50) {
    try {
      const res = await fetch(`${API_BASE}/api/music/failover-log?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [];
    }
  },
};
