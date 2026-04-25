/**
 * GEN AUDIUS v3.0 — PROVIDER ENGINE
 * ===================================
 * Robust internal routing for AI services.
 * The user NEVER sees which API processes their request.
 * Admin controls all flows from the panel.
 *
 * Features:
 *  - Weighted random selection
 *  - Automatic failover to next active provider
 *  - Real API callers for ElevenLabs, OpenAI, Gemini, Claude, Flux
 *  - Simulated response for server-side-only APIs
 */

// ── PROVIDER DEFINITIONS ────────────────────────────────────
export const PROVIDERS = {
  music: [
    // Active defaults (what you actually use today)
    { id: "gau",      name: "GenAudius (GAU) Finetune", weight: 60, active: true,  cost: 0.12, latency: 20, keyId: "MODAL" },
    { id: "MODAL",    name: "Gen Audius Serverless",    weight: 40, active: true,  cost: 0.10, latency: 15, keyId: "MODAL" },

    // Kept for future enablement (disabled by default)
    { id: "kie",      name: "Kie.ia (Suno)",            weight: 30, active: false, cost: 0.06, latency: 12, keyId: "kie"      },
    { id: "mureka",   name: "Mureka",                  weight: 20, active: false, cost: 0.05, latency: 15, keyId: "mureka"   },
    { id: "musicgpt", name: "MusicGPT",                weight: 10, active: false, cost: 0.04, latency: 20, keyId: "musicgpt" },
  ],
  image: [
    { id: "dalle3",   name: "DALL-E 3",   weight: 35, active: true,  cost: 0.04, latency: 5,  keyId: "openai"   },
    { id: "midj",     name: "Midjourney", weight: 35, active: true,  cost: 0.05, latency: 7,  keyId: "midj"     },
    { id: "flux",     name: "Flux.1",     weight: 20, active: true,  cost: 0.03, latency: 4,  keyId: "flux"     },
    { id: "sdxl",     name: "SDXL",       weight: 10, active: true,  cost: 0.01, latency: 3,  keyId: "sdxl"     },
  ],
  video: [
    { id: "kie_vid",  name: "Kie Video",  weight: 40, active: true,  cost: 0.20, latency: 30, keyId: "kie_vid"  },
    { id: "runway",   name: "Runway",     weight: 30, active: true,  cost: 0.25, latency: 25, keyId: "runway"   },
    { id: "pika",     name: "Pika",       weight: 20, active: true,  cost: 0.18, latency: 35, keyId: "pika"     },
    { id: "luma",     name: "Luma",       weight: 10, active: false, cost: 0.22, latency: 40, keyId: "luma"     },
  ],
  voice: [
    { id: "elevenlabs", name: "ElevenLabs", weight: 50, active: true,  cost: 0.03, latency: 3,  keyId: "elevenlabs" },
    { id: "openai_tts", name: "OpenAI TTS", weight: 30, active: true,  cost: 0.015, latency: 2, keyId: "openai"    },
    { id: "udio",       name: "Udio",       weight: 20, active: true,  cost: 0.04, latency: 5,  keyId: "udio"      },
  ],
  lyrics: [
    { id: "gpt4o",     name: "GPT-4o",      weight: 40, active: true,  cost: 0.02, latency: 2,  keyId: "openai"    },
    { id: "gemini",    name: "Gemini",      weight: 30, active: true,  cost: 0.01, latency: 2,  keyId: "gemini"    },
    { id: "claude_ai", name: "Claude",      weight: 20, active: true,  cost: 0.02, latency: 3,  keyId: "claude_ai" },
    { id: "gpt4mini",  name: "GPT-4o mini", weight: 10, active: true,  cost: 0.005, latency: 1, keyId: "openai"    },
  ],
};

// ═══════════════════════════════════════════════════════════
//  REAL API CALLERS
// ═══════════════════════════════════════════════════════════

// ElevenLabs TTS
async function callElevenLabs(text, apiKey, voiceId = "21m00Tcm4TlvDq8ikWAM") {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs error: ${res.status}`);
  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), type: "audio/mpeg" };
}

// OpenAI TTS
async function callOpenAITTS(text, apiKey) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "tts-1-hd", input: text, voice: "nova" }),
  });
  if (!res.ok) throw new Error(`OpenAI TTS error: ${res.status}`);
  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), type: "audio/mpeg" };
}

// OpenAI Image (DALL-E 3)
async function callDallE3(prompt, apiKey, size = "1024x1024") {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size, quality: "hd" }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `DALL-E error: ${res.status}`); }
  const data = await res.json();
  return { url: data.data[0].url, revised_prompt: data.data[0].revised_prompt };
}

// OpenAI GPT-4o Lyrics
async function callGPT4oLyrics(prompt, apiKey, options = {}) {
  const { lang = "Español", genre = "Pop", theme = "Amor", structure = "Verso + Coro" } = options;
  const sys = `Eres un compositor profesional. Genera letras de canción en ${lang}, género ${genre}, tema ${theme}, estructura: ${structure}. Responde SOLO con las letras, sin explicaciones. Usa saltos de línea y etiquetas como [Verso 1], [Coro], [Puente].`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o", messages: [{ role: "system", content: sys }, { role: "user", content: prompt || `Escribe una canción de ${theme}` }], max_tokens: 800, temperature: 0.9 }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `GPT-4o error: ${res.status}`); }
  const data = await res.json();
  return { text: data.choices[0].message.content, tokens: data.usage?.total_tokens };
}

// OpenAI GPT-4o mini Lyrics (cheaper)
async function callGPT4MiniLyrics(prompt, apiKey, options = {}) {
  const { lang = "Español", genre = "Pop", theme = "Amor" } = options;
  const sys = `Compositor profesional. Genera letras en ${lang}, ${genre}, tema: ${theme}. Solo letras con etiquetas [Verso], [Coro].`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: sys }, { role: "user", content: prompt || `Canción sobre ${theme}` }], max_tokens: 600, temperature: 0.85 }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `GPT-4o-mini error: ${res.status}`); }
  const data = await res.json();
  return { text: data.choices[0].message.content, tokens: data.usage?.total_tokens };
}

// Google Gemini Lyrics
async function callGeminiLyrics(prompt, apiKey, options = {}) {
  const { lang = "Español", genre = "Pop", theme = "Amor" } = options;
  const fullPrompt = `Eres compositor profesional. Escribe letras de canción en ${lang}, género ${genre}, tema ${theme}. Solo las letras con etiquetas [Verso 1], [Coro]. Prompt: ${prompt || `canción de ${theme}`}`;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }], generationConfig: { maxOutputTokens: 800, temperature: 0.9 } }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `Gemini error: ${res.status}`); }
  const data = await res.json();
  return { text: data.candidates[0].content.parts[0].text, tokens: data.usageMetadata?.totalTokenCount };
}

// Anthropic Claude Lyrics
async function callClaudeLyrics(prompt, apiKey, options = {}) {
  const { lang = "Español", genre = "Pop", theme = "Amor" } = options;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 800,
      system: `Compositor profesional. Escribe letras en ${lang}, género ${genre}, tema ${theme}. Solo letras con [Verso 1], [Coro], [Puente].`,
      messages: [{ role: "user", content: prompt || `Escribe una canción de ${theme}` }]
    }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `Claude error: ${res.status}`); }
  const data = await res.json();
  return { text: data.content[0].text };
}

// Flux.1 image via BFL API
async function callFlux(prompt, apiKey) {
  const res = await fetch("https://api.bfl.ml/v1/flux-pro-1.1", {
    method: "POST",
    headers: { "x-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, width: 1024, height: 1024, steps: 28 }),
  });
  if (!res.ok) throw new Error(`Flux error: ${res.status}`);
  const data = await res.json();
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const p = await fetch(`https://api.bfl.ml/v1/get_result?id=${data.id}`, { headers: { "x-key": apiKey } });
    const pollRes = await p.json();
    if (pollRes.status === "Ready") return { url: pollRes.result.sample };
    if (pollRes.status === "Error") throw new Error("Flux generation failed");
  }
  throw new Error("Flux timeout");
}

// ═══════════════════════════════════════════════════════════
//  MASTER CALLER — routes to correct API, handles failover
// ═══════════════════════════════════════════════════════════

/**
 * Selects a provider based on weight distribution (for display/admin use)
 */
export function selectProvider(type, providerState) {
  const list = (providerState?.[type] || PROVIDERS[type]).filter(p => p.active);
  if (!list.length) return null;
  const total = list.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of list) { r -= p.weight; if (r <= 0) return p; }
  return list[0];
}

/**
 * Master API Caller — Weighted selection + automatic failover
 * @param {string} type - 'music' | 'image' | 'video' | 'voice' | 'lyrics'
 * @param {string} prompt - User prompt
 * @param {object} providerState - Current provider configuration (from admin)
 * @param {object} apiKeys - API keys object keyed by provider keyId
 * @param {object} options - Additional options (lang, genre, theme, etc.)
 */
export async function callCreationAPI(type, prompt, providerState, apiKeys, options = {}) {
  const providers = (providerState?.[type] || PROVIDERS[type]).filter(p => p.active);
  if (!providers.length) throw new Error("No hay proveedores activos para este tipo");

  // Weighted selection
  const total = providers.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total, selected = providers[0];
  for (const p of providers) { r -= p.weight; if (r <= 0) { selected = p; break; } }

  // Try selected, then failover to remaining
  const order = [selected, ...providers.filter(p => p.id !== selected.id)];

  let lastErr;
  for (const prov of order) {
    const key = apiKeys[prov.keyId]?.apiKey || "";
    try {
      let result;
      switch (prov.id) {
        // ── VOICE ──
        case "elevenlabs":
          if (!key) throw new Error("ElevenLabs key no configurada");
          result = await callElevenLabs(prompt, key, apiKeys.elevenlabs?.voiceId);
          return { provider: prov.name, type: "audio", ...result };

        case "openai_tts":
          if (!key) throw new Error("OpenAI key no configurada");
          result = await callOpenAITTS(prompt, key);
          return { provider: prov.name, type: "audio", ...result };

        // ── LYRICS ──
        case "gpt4o":
          if (!key) throw new Error("OpenAI key no configurada");
          result = await callGPT4oLyrics(prompt, key, options);
          return { provider: prov.name, type: "lyrics", ...result };

        case "gpt4mini":
          if (!key) throw new Error("OpenAI key no configurada");
          result = await callGPT4MiniLyrics(prompt, key, options);
          return { provider: prov.name, type: "lyrics", ...result };

        case "gemini":
          if (!key) throw new Error("Gemini key no configurada");
          result = await callGeminiLyrics(prompt, key, options);
          return { provider: prov.name, type: "lyrics", ...result };

        case "claude_ai":
          if (!key) throw new Error("Claude key no configurada");
          result = await callClaudeLyrics(prompt, key, options);
          return { provider: prov.name, type: "lyrics", ...result };

        // ── IMAGE ──
        case "dalle3":
          if (!key) throw new Error("OpenAI key no configurada");
          result = await callDallE3(prompt, key);
          return { provider: prov.name, type: "image", ...result };

        case "flux":
          if (!key) throw new Error("Flux key no configurada");
          result = await callFlux(prompt, key);
          return { provider: prov.name, type: "image", ...result };

        // ── MUSIC — via backend proxy ──
        case "MODAL":
        case "gau":
        case "modal":
        case "kie":
        case "mureka":
        case "musicgpt":
          if (type === "music") {
              // We use the existing backend integration for music
              // the backend handles the actual API request securely
              const { generateMusic, pollUntilReady } = await import('./aiService');
              const data = await generateMusic({ 
                  prompt, 
                  genre: options.genre || options.styles || 'Pop', 
                  style: options.theme || 'Energetic',
                  lyrics: options.lyrics || '',
                  voice: options.gender === 'female' ? 'F' : 'M',
                  model: options.model,
                  negative_tags: options.negative_tags,
                  style_weight: options.style_weight,
                  weirdness: options.weirdness,
                  audio_weight: options.audio_weight,
                  title: options.title,
                  provider: prov.id,
                  apiKey: key
              });
              
              if ((!data?.tasks || data.tasks.length === 0) && !data?.task_id) throw new Error("No se pudo iniciar la generación de música en el backend");
              
              // Instead of polling here and blocking the UI, we just return the raw task list 
              // for the React component to manage its own loading indicators.
              return { 
                  provider: prov.name, 
                  type: "audio", 
                  tasks: data.tasks,
                  task_id: data.task_id,
                  note: `Generado vía backend` 
              };
          }
          throw new Error(`Integración no soportada para ${prov.id}`);

        // ── VIDEO — require server-side integration ──
        default:
          await new Promise(res => setTimeout(res, Math.random() * 3000 + 2000));
          return {
            provider: prov.name,
            type: "video",
            url: null,
            note: `${prov.name} ${!key ? '(Sin API Key)' : ''} requiere integración server-side (Video simulado)`
          };
      }
    } catch (err) {
      lastErr = err;
      console.warn(`[${prov.name}] falló: ${err.message} — intentando siguiente proveedor`);
      continue;
    }
  }
  throw lastErr || new Error("Todos los proveedores fallaron");
}
