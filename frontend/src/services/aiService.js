/**
 * Gen Audius Pro — AI Service Layer
 * ====================================
 * Integrates:
 *  - KIE.AI music generation (via backend proxy)
 *  - Masterchannel / AI mastering
 *  - Web Audio API analysis
 *  - MIDI chord suggestions
 *  - Genre mix profiles
 *
 * All backend calls go through /api/backend (Vite proxy → Python FastAPI on :8000)
 */

const BACKEND_URL = '/api/backend';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
    const userId = localStorage.getItem('ga_user_id') || '';
    const token = localStorage.getItem('ga_token') || '';
    const baseHeaders = { 'Content-Type': 'application/json', 'X-User-ID': userId };
    if (token) baseHeaders['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BACKEND_URL}${path}`, {
        headers: { ...baseHeaders, ...options.headers },
        ...options,
    });
    if (!res.ok) {
        let errorDetail = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            errorDetail = typeof err.detail === 'string' ? err.detail
                        : typeof err.error === 'string'  ? err.error
                        : JSON.stringify(err.detail || err.error || err);
        } catch {}
        throw new Error(errorDetail);
    }
    return res.json();
}

// ─── 1. MUSIC GENERATION ──────────────────────────────────────────────────────

/**
 * Genera una canción completa vía KIE.AI
 * @param {object} opts - { prompt, genre, voice, style, lyrics }
 * @returns {object} { task_id, status, credits_remaining }
 */
export async function generateMusic({ 
    prompt, genre, voice = 'M', style, lyrics, provider, apiKey, 
    model = 'V3.5', negative_tags, style_weight, weirdness, audio_weight, title
}) {
    const payload = {
        prompt: buildPrompt({ prompt, genre, voice, style }),
        genre: genre || null,
        lyrics: lyrics || '',
        voice,
        style: style || mapGenreToStyle(genre),
        title: title || null,
        model,
        negative_tags: negative_tags || null,
        style_weight: style_weight || null,
        weirdness: weirdness || null,
        audio_weight: audio_weight || null,
        provider: provider || 'kie',
        api_key: apiKey || null,
    };

    console.log('🎵 [AI] Enviando a backend → kie.ai:', payload);
    const data = await apiFetch('/api/music/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    console.log('✅ [AI] Response:', data);
    return data;
}

/**
 * Consulta el estado de una tarea de generación
 * @param {string} taskId
 */
export async function getGenerationStatus(taskId) {
    if (!taskId) return { status: 'failed', error: 'Missing Task ID' };
    return apiFetch(`/api/music/feed/${taskId}`);
}

/** Alias for backwards compatibility */
export const getFeed = getGenerationStatus;

/**
 * Poll hasta que la canción esté lista (máx 3 min)
 * @param {string} taskId
 * @param {function} onProgress  callback(percent: number, status: string)
 * @returns {Promise<object>} resolved track data
 */
export async function pollUntilReady(taskId, onProgress) {
    const MAX_ATTEMPTS = 240;   // 240 × 5s = 20 min
    const INTERVAL_MS  = 5000;
    let attempt = 0;

    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            attempt++;
            try {
                const data = await getGenerationStatus(taskId);
                const status   = data?.status || data?.data?.status || '';
                const isComplete = status === 'complete' || status === 'ready' || status === 'SUCCESS';
                const isFailed   = status === 'failed'  || status === 'error' || status === 'FAILED' || status === 'denied' || status === 'cancelled';

                // Progress: 15% → 95% linearly across attempts
                const percent = Math.min(15 + Math.floor((attempt / MAX_ATTEMPTS) * 80), 95);
                onProgress?.(percent, status, data);

                if (isComplete) {
                    clearInterval(interval);
                    onProgress?.(100, 'complete');
                    // Normalize response shape
                    const track = data?.data?.response?.sunoData?.[0] || data;
                    resolve(track);
                } else if (isFailed || attempt >= MAX_ATTEMPTS) {
                    clearInterval(interval);
                    const errorDetail = data?.error || data?.msg || data?.message;
                    const finalError = errorDetail ? `KIE.AI: ${errorDetail}` : 'Generación fallida en KIE.AI';
                    reject(new Error(isFailed ? finalError : 'Timeout — la generación tomó demasiado tiempo'));
                }
            } catch (e) {
                clearInterval(interval);
                reject(e);
            }
        }, INTERVAL_MS);
    });
}

// ─── 2. LYRICS GENERATION ─────────────────────────────────────────────────────

/**
 * Genera letra de canción vía backend (que llama KIE.AI)
 * @param {object} opts - { theme, genre, lang }
 * @returns {string} lyrics text
 */
export async function generateLyrics({ theme, genre, lang = 'es' }) {
    // Proxy through backend to keep API key secure
    const data = await apiFetch('/api/music/generate-lyrics', {
        method: 'POST',
        body: JSON.stringify({ theme, genre, lang }),
    });
    return data?.lyrics || data?.data?.lyrics || 'No se pudo generar la letra.';
}

// ─── 3. MASTERING ─────────────────────────────────────────────────────────────

/**
 * Master a track via Masterchannel or AI profile
 * @param {object} opts - { audioUrl, genre, targetLufs }
 * @returns {object} mastering result with profile
 */
export async function masterTrack({ audioUrl, genre, targetLufs = -14 }) {
    const data = await apiFetch('/api/music/master', {
        method: 'POST',
        body: JSON.stringify({
            audio_url: audioUrl,
            genre: genre || null,
            target_lufs: targetLufs,
        }),
    });
    return data;
}

// ─── 4. AUDIO ANALYSIS ────────────────────────────────────────────────────────

/**
 * Analiza un AudioBuffer y retorna métricas + perfil de mastering recomendado
 * @param {AudioBuffer} buffer
 * @returns {object} masteringProfile
 */
export function analyzeAndRecommendMastering(buffer) {
    if (!buffer) return getDefaultMasterProfile();

    const channelData = buffer.getChannelData(0);
    const len         = channelData.length;
    const sampleRate  = buffer.sampleRate;

    // ── RMS (loudness) ────────────────────────────────────
    let sumSquares = 0;
    for (let i = 0; i < len; i++) sumSquares += channelData[i] ** 2;
    const rms   = Math.sqrt(sumSquares / len);
    const rmsDb = 20 * Math.log10(rms + 1e-10);

    // ── Peak ──────────────────────────────────────────────
    let peak = 0;
    for (let i = 0; i < len; i++) {
        const abs = Math.abs(channelData[i]);
        if (abs > peak) peak = abs;
    }
    const peakDb = 20 * Math.log10(peak + 1e-10);

    // ── Spectral centroid (brightness) ───────────────────
    const fftSize = 2048;
    let weightedSum = 0, magnitudeSum = 0;
    for (let i = 0; i < fftSize / 2; i++) {
        const freq = (i / (fftSize / 2)) * (sampleRate / 2);
        const mag  = Math.abs(channelData[i % len]);
        weightedSum  += freq * mag;
        magnitudeSum += mag;
    }
    const centroid     = magnitudeSum > 0 ? weightedSum / magnitudeSum : 2000;
    const dynamicRange = peakDb - rmsDb;

    console.log(`📊 [AI Master] RMS: ${rmsDb.toFixed(1)}dB | Peak: ${peakDb.toFixed(1)}dB | Centroid: ${centroid.toFixed(0)}Hz | DR: ${dynamicRange.toFixed(1)}`);

    return buildMasterProfile({ rmsDb, peakDb, centroid, dynamicRange });
}

function buildMasterProfile({ rmsDb, peakDb, centroid, dynamicRange }) {
    const gainNeeded    = Math.max(-12, Math.min(6, -14 - rmsDb));
    const needsMoreBass = centroid > 3500;
    const needsBright   = centroid < 1500;
    const overCompressed = dynamicRange < 4;

    return {
        analysis: {
            rmsDb:        rmsDb.toFixed(1),
            peakDb:       peakDb.toFixed(1),
            centroid:     centroid.toFixed(0),
            dynamicRange: dynamicRange.toFixed(1),
        },
        chain: {
            eq: {
                low:  needsMoreBass ? '+2.5' : '-1.0',
                mid:  '-0.5',
                high: needsBright   ? '+2.0' : '+0.5',
                q:    '0.80',
            },
            comp: {
                threshold: `${Math.round(-18 + gainNeeded)}dB`,
                ratio:     overCompressed ? '1.5:1' : '2.5:1',
                attack:    '8ms',
                release:   '200ms',
                gain:      `+${Math.max(0, gainNeeded).toFixed(1)}dB`,
            },
            stereoWidth: { width: '110%', mono: true },
            limiter:     { ceiling: '-0.1dBTP', threshold: '-5dB' },
        },
        lufsTarget:  -14,
        ratingScore: Math.min(100, Math.max(40, 80 + rmsDb * 0.5)),
        aiRemark:    buildRemark({ rmsDb, centroid, dynamicRange }),
    };
}

function buildRemark({ rmsDb, centroid, dynamicRange }) {
    const parts = [];
    if      (rmsDb < -20) parts.push('Mix muy suave — el compresor aumentará el volumen global.');
    else if (rmsDb > -8)  parts.push('Mix ya es denso — limitando suavemente para headroom.');
    else                  parts.push('Nivel RMS óptimo para streaming.');

    if      (centroid < 1500) parts.push('Espectro cargado en bajos — el EQ levanta los agudos.');
    else if (centroid > 4000) parts.push('Mix brillante — ecualizando bajos y medios.');
    else                      parts.push('Balance espectral equilibrado.');

    if (dynamicRange < 4) parts.push('Rango dinámico muy comprimido — ratio suavizado.');
    else                  parts.push('Dinámica natural preservada.');

    return parts.join(' ');
}

function getDefaultMasterProfile() {
    return buildMasterProfile({ rmsDb: -14, peakDb: -2, centroid: 2500, dynamicRange: 12 });
}

// ─── 5. CHORD SUGGESTIONS ─────────────────────────────────────────────────────

const CHORD_BANKS = {
    bachata: [
        { name: 'Dm7',    notes: ['D4', 'F4', 'A4', 'C5'],       mood: 'Melancólico' },
        { name: 'Gm7',    notes: ['G4', 'Bb4', 'D5', 'F5'],      mood: 'Cálido' },
        { name: 'Bbmaj7', notes: ['Bb4', 'D5', 'F5', 'A5'],      mood: 'Romántico' },
        { name: 'A7',     notes: ['A4', 'C#5', 'E5', 'G5'],      mood: 'Tensión' },
        { name: 'Cmaj7',  notes: ['C5', 'E5', 'G5', 'B5'],       mood: 'Esperanza' },
        { name: 'Gm',     notes: ['G4', 'Bb4', 'D5'],             mood: 'Nostálgico' },
    ],
    reggaeton: [
        { name: 'Am7',   notes: ['A4', 'C5', 'E5', 'G5'],        mood: 'Oscuro' },
        { name: 'Fmaj7', notes: ['F4', 'A4', 'C5', 'E5'],        mood: 'Suave' },
        { name: 'G7',    notes: ['G4', 'B4', 'D5', 'F5'],        mood: 'Tensión' },
        { name: 'C',     notes: ['C5', 'E5', 'G5'],               mood: 'Claro' },
        { name: 'Dm',    notes: ['D4', 'F4', 'A4'],               mood: 'Duro' },
    ],
    trap: [
        { name: 'D#m',   notes: ['D#4', 'F#4', 'A#4'],           mood: 'Oscuro' },
        { name: 'Cm7',   notes: ['C4', 'Eb4', 'G4', 'Bb4'],      mood: 'Frío' },
        { name: 'Abmaj7',notes: ['Ab4', 'C5', 'Eb5', 'G5'],      mood: 'Épico' },
        { name: 'Bbm',   notes: ['Bb4', 'Db5', 'F5'],             mood: 'Pesado' },
    ],
    amapiano: [
        { name: 'Fmaj9',  notes: ['F4', 'A4', 'C5', 'E5', 'G5'],  mood: 'Afro' },
        { name: 'Bbmaj7', notes: ['Bb4', 'D5', 'F5', 'A5'],        mood: 'Groove' },
        { name: 'Gm11',   notes: ['G4', 'Bb4', 'D5', 'F5', 'C5'], mood: 'Log drum' },
        { name: 'Cm7',    notes: ['C5', 'Eb5', 'G5', 'Bb5'],       mood: 'Deep' },
    ],
};

export function getAIChordSuggestions(genre) {
    const bank = CHORD_BANKS[genre] || CHORD_BANKS.bachata;
    return [...bank].sort(() => Math.random() - 0.5);
}

// ─── 6. MIX PROFILES ──────────────────────────────────────────────────────────

export function getAIMixProfile(genre) {
    const profiles = {
        bachata: {
            label: 'Bachata ADN',
            eq:    { low: '+3', mid: '-1', high: '+2' },
            comp:  { threshold: '-18dB', ratio: '3:1', attack: '10ms', release: '150ms' },
            reverb: { room: 'Hall medium', wet: '25%' },
            delay:  { time: '1/8',  feedback: '20%' },
        },
        reggaeton: {
            label: 'Reggaetón 808',
            eq:    { low: '+5', mid: '0',  high: '+1' },
            comp:  { threshold: '-12dB', ratio: '6:1', attack: '5ms',  release: '80ms' },
            reverb: { room: 'Room small', wet: '15%' },
            delay:  { time: '1/16', feedback: '10%' },
        },
        trap: {
            label: 'Trap Latino',
            eq:    { low: '+4', mid: '-2', high: '+3' },
            comp:  { threshold: '-10dB', ratio: '8:1', attack: '3ms',  release: '60ms' },
            reverb: { room: 'Plate', wet: '30%' },
            delay:  { time: '1/8D', feedback: '30%' },
        },
        amapiano: {
            label: 'Amapiano Log',
            eq:    { low: '+4', mid: '+1', high: '+2' },
            comp:  { threshold: '-14dB', ratio: '4:1', attack: '8ms',  release: '120ms' },
            reverb: { room: 'Church large', wet: '40%' },
            delay:  { time: '3/16', feedback: '25%' },
        },
    };
    return profiles[genre] || profiles.bachata;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function buildPrompt({ prompt, genre, voice, style }) {
    const voiceLabel = voice === 'F' ? 'female vocals' : 'male vocals';
    return [
        prompt || '',
        genre ? `Genre: ${mapGenreToStyle(genre)}` : '',
        `Voice: ${voiceLabel}`,
        style  ? `Style: ${style}` : '',
        'High quality, professional production, studio quality',
    ].filter(Boolean).join('. ');
}

function mapGenreToStyle(genre) {
    const map = {
        bachata:   'bachata romántica, guitar, flute',
        reggaeton: 'reggaeton urbano, 808 bass, perreo',
        trap:      'trap latino, dark 808, hi-hats',
        amapiano:  'amapiano, log drum, piano, afrohouse',
        salsa:     'salsa dura, brass, piano montuno',
        merengue:  'merengue, accordion, tambora',
    };
    return map[genre] || genre || 'latin music';
}