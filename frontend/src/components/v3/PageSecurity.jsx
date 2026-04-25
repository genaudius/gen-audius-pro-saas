import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Activity, Globe, Monitor, User, AlertTriangle, Fingerprint } from 'lucide-react';
import { C } from '../../utils/designTokens';

export default function PageSecurity() {
  const [logs, setLogs] = useState([
    { id: 1, event_type: "login_fail", severity: "medium", ip_address: "192.168.1.1", details: "3 intentos fallidos", created_at: new Date().toISOString(), user_id: "u_2831" },
    { id: 2, event_type: "suspicious_activity", severity: "high", ip_address: "45.12.83.2", details: "Acceso desde ubicación inusual", created_at: new Date().toISOString(), user_id: "u_9102" },
    { id: 3, event_type: "fraud_attempt", severity: "critical", ip_address: "88.23.11.9", details: "Múltiples tarjetas rechazadas", created_at: new Date().toISOString(), user_id: "u_4412" }
  ]);

  const severityCol = (s) => {
    if (s === 'critical') return C.err;
    if (s === 'high') return C.warn;
    if (s === 'medium') return C.aLt;
    return C.ok;
  };

  return (
    <div style={{ animation: "v3-fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.t1, display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldAlert size={28} color={C.err} /> Seguridad & Protección
          </h2>
          <p style={{ fontSize: 13, color: C.t2 }}>Monitoreo anti-fraude y detección de actividad sospechosa.</p>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "8px 16px", background: C.ok + "15", border: `1px solid ${C.ok}30`, borderRadius: 8 }}>
          <ShieldCheck size={18} color={C.ok} />
          <span style={{ fontSize: 13, color: C.ok, fontWeight: 700 }}>SISTEMA PROTEGIDO</span>
        </div>
      </div>

      <div className="v3-g3" style={{ marginBottom: 24 }}>
        <div className="v3-stat-card">
          <Activity size={20} color={C.a} />
          <div className="v3-stat-val">0</div>
          <div className="v3-stat-lbl">Infecciones detectadas</div>
        </div>
        <div className="v3-stat-card">
          <Globe size={20} color={C.warn} />
          <div className="v3-stat-val">1.2k</div>
          <div className="v3-stat-lbl">IPs Bloqueadas</div>
        </div>
        <div className="v3-stat-card">
          <Fingerprint size={20} color={C.ok} />
          <div className="v3-stat-val">99.9%</div>
          <div className="v3-stat-lbl">Login Uptime</div>
        </div>
      </div>

      <div className="v3-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: C.div, padding: "12px 20px", fontSize: 12, fontWeight: 800, color: C.t2, textTransform: "uppercase", letterSpacing: 1 }}>
          Últimos Eventos de Seguridad
        </div>
        <table className="v3-tbl">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Usuario</th>
              <th>IP / Origen</th>
              <th>Gravedad</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AlertTriangle size={14} color={severityCol(l.severity)} />
                    <div style={{ fontWeight: 600 }}>{l.event_type}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{l.details}</div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <User size={14} color={C.t3} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{l.user_id}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Monitor size={14} color={C.t3} />
                    <span style={{ fontSize: 13 }}>{l.ip_address}</span>
                  </div>
                </td>
                <td>
                  <span className="v3-tag" style={{ background: severityCol(l.severity) + "15", color: severityCol(l.severity), borderColor: severityCol(l.severity) + "30" }}>
                    {l.severity.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: C.t3 }}>
                  {new Date(l.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
