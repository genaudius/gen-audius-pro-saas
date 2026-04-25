import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    User, Music, Mic2, Radio, Headphones, Disc, Star, 
    CheckCircle, Mail, Shield, Smartphone, Globe, Share2, 
    Lock, Wallet, History, Settings
} from 'lucide-react';
import { C } from '../../utils/designTokens';
import { useLang } from '../../i18n/LanguageContext';

export default function PageProfileSettings({ user }) {
  const { t } = useLang();
  
  const [profile, setProfile] = useState({
    username: user?.username || "Usuario Pro",
    role: user?.role || "user",
    artist_type: user?.artist_type || "artista_indie",
    email: user?.email || "usuario@genaudius.com",
    is_verified: user?.is_verified || false,
    bio: "Passionate about AI music and sound engineering.",
    spotify_id: "",
    lastfm_user: ""
  });

  const artistTypes = [
    { id: "dj", label: "DJ / Selector", icon: <Disc size={18} /> },
    { id: "locutor", label: "Locutor", icon: <Mic2 size={18} /> },
    { id: "musico", label: "Músico Instrumental", icon: <Music size={18} /> },
    { id: "productor", label: "Productor / Beatmaker", icon: <Headphones size={18} /> },
    { id: "artista_indie", label: "Artista Independiente", icon: <Star size={18} /> },
  ];

  return (
    <div style={{ animation: "v3-fadeUp 0.4s ease", maxWidth: 1000, margin: "0 auto", padding: "60px 20px" }}>
      
      {/* Header Area */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: C.t1, letterSpacing: "-0.02em" }}>
          {t('profile.title')} <span style={{ color: C.a }}>Pro</span>
        </h2>
        <p style={{ fontSize: 14, color: C.t2, marginTop: 4 }}>{t('profile.subtitle')}</p>
      </div>

      <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
        
        {/* Sidebar Mini */}
        <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="v3-card" style={{ textAlign: "center", padding: 30, background: 'linear-gradient(180deg, rgba(123,92,250,0.05) 0%, rgba(26,26,36,1) 100%)' }}>
            <div style={{ width: 110, height: 110, borderRadius: "50%", background: C.div, margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${C.a}`, overflow: 'hidden' }}>
              <img src="/assets/brand/icon.png" alt="Profile" style={{ width: '60%', opacity: 0.8 }} />
            </div>
            <h3 style={{ fontSize: 20, color: C.t1, fontWeight: 800 }}>{profile.username}</h3>
            <span className="v3-tag" style={{ marginTop: 8, background: C.a + '15', color: C.a }}>{profile.role.toUpperCase()}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            <button className="v3-btn v3-btn-gh" style={{ justifyContent: "flex-start", gap: 12, background: 'rgba(123,92,250,0.1)', color: C.t1, borderColor: C.a + '40' }}>
              <User size={16} /> {t('profile.title')}
            </button>
            <button className="v3-btn v3-btn-gh" style={{ justifyContent: "flex-start", gap: 12 }}>
              <Wallet size={16} /> Wallet & Créditos
            </button>
            <button className="v3-btn v3-btn-gh" style={{ justifyContent: "flex-start", gap: 12 }}>
              <History size={16} /> Historial Pro
            </button>
            <button className="v3-btn v3-btn-gh" style={{ justifyContent: "flex-start", gap: 12 }}>
              <Settings size={16} /> Preferencias
            </button>
          </div>
        </div>

        {/* Formulario Principal */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          
          <div className="v3-card">
            <div className="v3-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Music size={18} color={C.a} /> {t('profile.artistInfo')}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              <div>
                <label className="v3-field-lbl">{t('profile.artistType')}</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                  {artistTypes.map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setProfile({...profile, artist_type: t.id})}
                      style={{ 
                        padding: "14px 15px", borderRadius: 12, border: "1px solid",
                        display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600,
                        transition: "all 0.2s",
                        borderColor: profile.artist_type === t.id ? C.a : C.div,
                        background: profile.artist_type === t.id ? C.a + '10' : 'transparent',
                        color: profile.artist_type === t.id ? C.a : C.t2
                      }}
                    >
                      <span style={{ opacity: profile.artist_type === t.id ? 1 : 0.5 }}>{t.icon}</span> 
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="v3-field-lbl">{t('profile.bio')}</label>
                <textarea 
                  className="v3-textarea" 
                  style={{ minHeight: 100 }}
                  value={profile.bio}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  placeholder="Cuéntanos sobre tu carrera musical..."
                />
              </div>
            </div>
          </div>

          <div className="v3-card">
            <div className="v3-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Shield size={18} color={C.ok} /> {t('profile.security')}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 18, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: `1px solid ${C.div}` }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: profile.is_verified ? C.ok + '15' : C.warn + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={22} color={profile.is_verified ? C.ok : C.warn} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>{profile.email}</div>
                    <div style={{ fontSize: 12, color: C.t3 }}>
                      {profile.is_verified ? t('profile.verified') : t('profile.pending')}
                    </div>
                  </div>
                </div>
                {!profile.is_verified && (
                  <button className="v3-btn v3-btn-gh v3-btn-sm" style={{ color: C.a }}>{t('profile.verifyBtn')}</button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                <button className="v3-btn v3-btn-gh" style={{ gap: 10, padding: 12 }}>
                  <Lock size={16} /> {t('profile.changePass')}
                </button>
                <button className="v3-btn v3-btn-gh" style={{ gap: 10, padding: 12 }}>
                  <Smartphone size={16} /> {t('profile.twoFactor')}
                </button>
              </div>
            </div>
          </div>

          <div className="v3-card">
            <div className="v3-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <Share2 size={18} color={C.warn} /> {t('profile.integrations')}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, border: `1px solid ${C.div}`, borderRadius: 14, background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1DB954', display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Music size={20} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Spotify Artist</div>
                  <div style={{ fontSize: 11, color: C.t3 }}>Sincroniza tus lanzamientos reales.</div>
                </div>
                <button className="v3-btn v3-btn-sm" style={{ background: '#1DB95420', color: '#1DB954', border: '1px solid #1DB95440' }}>Conectar</button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, border: `1px solid ${C.div}`, borderRadius: 14, background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#D51007', display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Radio size={20} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Last.fm Scrobbling</div>
                  <div style={{ fontSize: 11, color: C.t3 }}>Registra lo que escuchas en Gen Audius.</div>
                </div>
                <button className="v3-btn v3-btn-sm" style={{ background: '#D5100720', color: '#D51007', border: '1px solid #D5100740' }}>Conectar</button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="v3-btn v3-btn-lg v3-btn-pr" style={{ minWidth: 200, boxShadow: `0 10px 30px ${C.a}30` }}>
                {t('profile.updateBtn')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
