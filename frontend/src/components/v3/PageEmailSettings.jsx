import React, { useState } from 'react';
import { Mail, Settings, Bell, Lock, Send, ShieldCheck, Database, Save } from 'lucide-react';
import { C } from '../../utils/designTokens';

export default function PageEmailSettings() {
  const [config, setConfig] = useState({
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    smtp_user: "",
    smtp_pass: "",
    from_email: "noreply@genaudius.com",
    notif_verify: true,
    notif_password: true,
    notif_login: false
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert("Configuración de correo guardada.");
  };

  return (
    <div style={{ animation: "v3-fadeUp 0.3s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.t1, display: "flex", alignItems: "center", gap: 10 }}>
          <Mail size={28} color={C.a} /> Ajustes de Correo & Notificaciones
        </h2>
        <p style={{ fontSize: 13, color: C.t2 }}>Configura el servidor SMTP y las reglas de notificaciones del sistema.</p>
      </div>

      <div className="v3-g2">
        <div className="v3-card">
          <div className="v3-card-title"><Database size={16} /> Servidor SMTP</div>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="v3-g2">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, color: C.t2, fontWeight: 700 }}>host o servidor</label>
                <input className="v3-inp" value={config.smtp_host} onChange={e => setConfig({...config, smtp_host: e.target.value})} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, color: C.t2, fontWeight: 700 }}>puerto</label>
                <input className="v3-inp" value={config.smtp_port} onChange={e => setConfig({...config, smtp_port: e.target.value})} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, color: C.t2, fontWeight: 700 }}>usuario smtp</label>
              <input className="v3-inp" value={config.smtp_user} onChange={e => setConfig({...config, smtp_user: e.target.value})} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, color: C.t2, fontWeight: 700 }}>contraseña / token</label>
              <input className="v3-inp" type="password" value={config.smtp_pass} onChange={e => setConfig({...config, smtp_pass: e.target.value})} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 12, color: C.t2, fontWeight: 700 }}>remitente (from)</label>
              <input className="v3-inp" value={config.from_email} onChange={e => setConfig({...config, from_email: e.target.value})} />
            </div>

            <button type="submit" className="v3-btn v3-btn-pr" style={{ marginTop: 10 }}>
              <Save size={18} style={{ marginRight: 8 }} /> Guardar SMTP
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="v3-card">
            <div className="v3-card-title"><Bell size={16} /> Notificaciones Automáticas</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Verificación de Cuenta</div>
                  <div style={{ fontSize: 12, color: C.t2 }}>Enviar enlace de verificación al registrarse.</div>
                </div>
                <input type="checkbox" checked={config.notif_verify} onChange={e => setConfig({...config, notif_verify: e.target.checked})} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Cambio de Contraseña</div>
                  <div style={{ fontSize: 12, color: C.t2 }}>Avisar cuando se cambie la clave de acceso.</div>
                </div>
                <input type="checkbox" checked={config.notif_password} onChange={e => setConfig({...config, notif_password: e.target.checked})} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Alertas de Inicio de Sesión</div>
                  <div style={{ fontSize: 12, color: C.t2 }}>Notificar accesos desde nuevos dispositivos.</div>
                </div>
                <input type="checkbox" checked={config.notif_login} onChange={e => setConfig({...config, notif_login: e.target.checked})} />
              </div>
            </div>
          </div>

          <div className="v3-card" style={{ background: `${C.a}08`, border: `1px dashed ${C.a}40` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ShieldCheck size={24} color={C.a} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.t1 }}>Prueba de Envío</div>
                <div style={{ fontSize: 12, color: C.t2, marginBottom: 12 }}>Envía un correo de prueba a tu email de administrador.</div>
                <button className="v3-btn v3-btn-gh v3-btn-sm"><Send size={14} style={{ marginRight: 6 }} /> Enviar Test</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
