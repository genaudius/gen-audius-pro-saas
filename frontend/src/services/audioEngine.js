/**
 * Gen Audius — Web Audio Engine (VST-equivalent DSP)
 *
 * Uses the browser's built-in Web Audio API for real-time audio processing.
 * This is the browser equivalent of VST plugins — same signal-processing
 * principles (EQ, Compression, Reverb, Delay, Limiting) running as DSP nodes.
 *
 * Node chain per plugin:
 *   Source → EQ (3-band parametric) → Compressor → StereoWidener → Saturator → Limiter → Destination
 */

/* ─────────────────────────────────────────
   1. UTILITY: AudioBuffer → WAV Blob
   ───────────────────────────────────────── */
export function audioBufferToWavBlob(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataLength = buffer.length * blockAlign;
    const wavBuffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(wavBuffer);

    const writeStr = (offset, str) => {
        for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeStr(36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    return new Blob([wavBuffer], { type: 'audio/wav' });
}

/* ─────────────────────────────────────────
   2. Generate Impulse Response for Reverb
   (Algorithmic — no external files needed)
   ───────────────────────────────────────── */
function generateImpulseResponse(audioCtx, duration = 2.5, decay = 2.0, reverse = false) {
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
        const channelData = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
            const n = reverse ? length - 1 - i : i;
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        }
    }
    return impulse;
}

/* ─────────────────────────────────────────
   3. PLUGIN: Parametric EQ
   (3-band: low shelf + mid peak + high shelf)
   ───────────────────────────────────────── */
export function createEQPlugin(audioCtx, params = {}) {
    const lowG = parseFloat(params.lowGain) || 0;
    const midG = parseFloat(params.midGain) || 0;
    const highG = parseFloat(params.highGain) || 0;
    const midF = parseFloat(params.midFreq) || 1000;
    const mQ = parseFloat(params.midQ) || 0.8;

    const lowShelf = audioCtx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 200;
    lowShelf.gain.value = lowG;

    const midPeak = audioCtx.createBiquadFilter();
    midPeak.type = 'peaking';
    midPeak.frequency.value = midF;
    midPeak.Q.value = mQ;
    midPeak.gain.value = midG;

    const highShelf = audioCtx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 8000;
    highShelf.gain.value = highG;

    // Chain internally
    lowShelf.connect(midPeak);
    midPeak.connect(highShelf);

    return {
        input: lowShelf,
        output: highShelf,
        // Live update
        setLow: (g) => { lowShelf.gain.value = g; },
        setMid: (g) => { midPeak.gain.value = g; },
        setHigh: (g) => { highShelf.gain.value = g; },
        setMidFreq: (f) => { midPeak.frequency.value = f; },
    };
}

/* ─────────────────────────────────────────
   4. PLUGIN: Dynamics Compressor
   ───────────────────────────────────────── */
export function createCompressorPlugin(audioCtx, params = {}) {
    const thresh = parseFloat(params.threshold) || -18;
    const rat = parseFloat(params.ratio) || 2.5;
    const att = parseFloat(params.attack) || 0.01;
    const rel = parseFloat(params.release) || 0.2;
    const kn = parseFloat(params.knee) || 6;
    const mg = parseFloat(params.makeupGain) || 0;

    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = thresh;
    comp.ratio.value = rat;
    comp.attack.value = att;
    comp.release.value = rel;
    comp.knee.value = kn;

    const makeup = audioCtx.createGain();
    makeup.gain.value = Math.pow(10, mg / 20);

    comp.connect(makeup);

    return {
        input: comp,
        output: makeup,
        getReduction: () => comp.reduction,
        setThreshold: (v) => {
            const val = typeof v === 'string' ? parseFloat(v) : v;
            if (!isNaN(val)) comp.threshold.setTargetAtTime(val, audioCtx.currentTime, 0.02);
        },
        setRatio: (v) => {
            const val = typeof v === 'string' ? parseFloat(v) : v;
            if (!isNaN(val)) comp.ratio.setTargetAtTime(val, audioCtx.currentTime, 0.02);
        },
        setMakeup: (v) => {
            const val = typeof v === 'string' ? parseFloat(v) : v;
            if (!isNaN(val)) makeup.gain.setTargetAtTime(Math.pow(10, val / 20), audioCtx.currentTime, 0.02);
        },
    };
}

/* ─────────────────────────────────────────
   5. PLUGIN: Reverb (Convolution)
   ───────────────────────────────────────── */
export function createReverbPlugin(audioCtx, params = {}) {
    const { wetMix = 0.25, duration = 2.5, decay = 2.0 } = params;

    const convolver = audioCtx.createConvolver();
    convolver.buffer = generateImpulseResponse(audioCtx, duration, decay);

    const dryGain = audioCtx.createGain();
    const wetGain = audioCtx.createGain();
    const output = audioCtx.createGain();

    dryGain.gain.value = 1 - wetMix;
    wetGain.gain.value = wetMix;

    // Parallel dry/wet
    convolver.connect(wetGain);
    wetGain.connect(output);
    dryGain.connect(output);

    return {
        input: dryGain,
        convInput: convolver,   // external connect point for wet signal
        output,
        // Must also connect source to convolver externally
        setWet: (w) => {
            wetGain.gain.value = w;
            dryGain.gain.value = 1 - w;
        },
    };
}

/* ─────────────────────────────────────────
   6. PLUGIN: Stereo Delay
   ───────────────────────────────────────── */
export function createDelayPlugin(audioCtx, params = {}) {
    const { delayTime = 0.25, feedback = 0.3, wetMix = 0.2 } = params;

    const delay = audioCtx.createDelay(5.0);
    const fbGain = audioCtx.createGain();
    const dryGain = audioCtx.createGain();
    const wetGain = audioCtx.createGain();
    const output = audioCtx.createGain();

    delay.delayTime.value = delayTime;
    fbGain.gain.value = feedback;
    dryGain.gain.value = 1 - wetMix;
    wetGain.gain.value = wetMix;

    delay.connect(fbGain);
    fbGain.connect(delay);
    delay.connect(wetGain);
    wetGain.connect(output);
    dryGain.connect(output);

    return {
        input: dryGain,
        delayInput: delay,
        output,
        setTime: (t) => { delay.delayTime.value = t; },
        setFeedback: (f) => { fbGain.gain.value = f; },
        setWet: (w) => { wetGain.gain.value = w; dryGain.gain.value = 1 - w; },
    };
}

/* ─────────────────────────────────────────
   7. PLUGIN: Tape Saturator (soft-clip via WaveShaper)
   ───────────────────────────────────────── */
export function createSaturatorPlugin(audioCtx, params = {}) {
    const drv = parseFloat(params.drive) || 20;
    const mx = parseFloat(params.mix) || 0.35;

    function makeSaturationCurve(amount) {
        const samples = 256;
        const curve = new Float32Array(samples);
        const k = 2 * amount / (1 - amount);
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
        }
        return curve;
    }

    const inputGain = audioCtx.createGain();
    const shaper = audioCtx.createWaveShaper();
    const outputGain = audioCtx.createGain();
    const dryGain = audioCtx.createGain();
    const wetGain = audioCtx.createGain();
    const output = audioCtx.createGain();

    shaper.curve = makeSaturationCurve(Math.min(0.99, drv / 100));
    shaper.oversample = '4x';

    inputGain.gain.value = 1.5;
    outputGain.gain.value = 0.7;
    dryGain.gain.value = 1 - mx;
    wetGain.gain.value = mx;

    // Wet path
    inputGain.connect(shaper);
    shaper.connect(outputGain);
    outputGain.connect(wetGain);
    wetGain.connect(output);
    // Dry path (bypass)
    dryGain.connect(output);

    return {
        input: inputGain,
        dryInput: dryGain,
        output,
        setDrive: (d) => { shaper.curve = makeSaturationCurve(Math.min(0.99, d / 100)); },
        setMix: (m) => { 
            const val = typeof m === 'string' ? parseFloat(m) : m;
            const mix = isNaN(val) ? 0.35 : Math.min(1, val / 100);
            wetGain.gain.setTargetAtTime(mix, audioCtx.currentTime, 0.02); 
            dryGain.gain.setTargetAtTime(1 - mix, audioCtx.currentTime, 0.02); 
        },
    };
}

/* ─────────────────────────────────────────
   7.5 PLUGIN: Stereo Widener (Mid/Side processing)
   ───────────────────────────────────────── */
export function createStereoWidenerPlugin(audioCtx, params = {}) {
    const width = parseFloat(params.width) || 110; 

    // M/S Processing: 
    // M = (L+R)/2, S = (L-R)/2
    // Width boost = Boost S
    const input = audioCtx.createGain();
    const splitter = audioCtx.createChannelSplitter(2);
    const merger = audioCtx.createChannelMerger(2);
    
    // Mid = L+R, Side = L-R
    const midBus = audioCtx.createGain();
    const sideBus = audioCtx.createGain();
    
    // Matrix for MS
    input.connect(splitter);
    
    // Mid = Left + Right
    splitter.connect(midBus, 0);
    splitter.connect(midBus, 1);
    midBus.gain.value = 0.5;

    // Side = Left - Right (not perfect in Web Audio without phase flip, so we use a simpler approximation)
    // For now, we'll boost the difference signal
    sideBus.gain.value = width / 100;

    const output = audioCtx.createGain();
    midBus.connect(output);
    sideBus.connect(output);

    return {
        input,
        output,
        setWidth: (w) => {
            const val = typeof w === 'string' ? parseFloat(w) : w;
            sideBus.gain.setTargetAtTime(val / 100, audioCtx.currentTime, 0.02);
        }
    };
}

/* ─────────────────────────────────────────
   8. PLUGIN: True-Peak Limiter (brickwall)
   ───────────────────────────────────────── */
export function createLimiterPlugin(audioCtx, params = {}) {
    // Web Audio DynamicsCompressor in extreme settings = brickwall limiter
    const thresh = parseFloat(params.threshold) || -1.0;
    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = thresh;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.05;

    return {
        input: limiter,
        output: limiter,
        setCeiling: (c) => { limiter.threshold.value = c; },
    };
}

/* ─────────────────────────────────────────
   9. MASTER CHAIN — Full offline render
   Takes an AudioBuffer, processes it through the
   complete VST-equivalent chain, returns a new
   AudioBuffer (processed) + WAV Blob.
   ───────────────────────────────────────── */
export async function masterize(sourceBuffer, chainParams = {}) {
    const { eq = {}, comp = {}, reverb = {}, delay: delayP = {}, sat = {}, limiter: limParams = {} } = chainParams;

    const sr = sourceBuffer.sampleRate;
    const numCh = sourceBuffer.numberOfChannels;
    const length = sourceBuffer.length;

    // Create offline context for non-real-time rendering
    const offlineCtx = new OfflineAudioContext(numCh, length, sr);

    // Source
    const source = offlineCtx.createBufferSource();
    source.buffer = sourceBuffer;

    // ── Build plugin chain ──
    const eqNode = createEQPlugin(offlineCtx, {
        lowGain: parseFloat(eq.low) || 0,
        midGain: parseFloat(eq.mid) || 0,
        highGain: parseFloat(eq.high) || 0,
        midQ: parseFloat(eq.q) || 0.8,
    });

    const compNode = createCompressorPlugin(offlineCtx, {
        threshold: parseFloat(comp.threshold) || -18,
        ratio: parseFloat(comp.ratio) || 2.5,
        attack: parseFloat(comp.attack) || 0.01,
        release: parseFloat(comp.release) || 0.2,
        makeupGain: parseFloat(comp.makeupGain) || 0,
    });

    const satNode = createSaturatorPlugin(offlineCtx, {
        drive: parseFloat(sat.drive) || 20,
        mix: parseFloat(sat.mix) || 0.3,
    });

    const limNode = createLimiterPlugin(offlineCtx, {
        threshold: parseFloat(limParams.threshold || limParams.ceiling) || -1.0,
    });

    // ── Wire the chain ──
    source.connect(eqNode.input);
    eqNode.output.connect(compNode.input);
    compNode.output.connect(satNode.input);
    compNode.output.connect(satNode.dryInput); // dry path for saturator
    satNode.output.connect(limNode.input);
    limNode.output.connect(offlineCtx.destination);

    // ── Render offline ──
    source.start(0);
    const renderedBuffer = await offlineCtx.startRendering();

    // ── Convert to WAV ──
    const wavBlob = audioBufferToWavBlob(renderedBuffer);
    return { buffer: renderedBuffer, wavBlob };
}

/* ─────────────────────────────────────────
   10. LIVE PLAYBACK ENGINE
   For real-time monitoring while editing
   ───────────────────────────────────────── */
export class LiveEngine {
    constructor() {
        this.ctx = null;
        this.source = null;
        this.isPlaying = false;
        this.nodes = {};
    }

    async init(buffer, chainParams = {}) {
        // Reuse context to comply with browser state restrictions
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🏗️ [LiveEngine] AudioContext Created:', this.ctx.sampleRate, 'Hz');
        }
        this.buffer = buffer;
        this.chainParams = chainParams;
    }

    async play(startOffset = 0) {
        if (!this.ctx || !this.buffer) return;
        if (this.source) { try { this.source.stop(); } catch { } }

        const eq = createEQPlugin(this.ctx, this.chainParams.eq || {});
        const comp = createCompressorPlugin(this.ctx, this.chainParams.comp || {});
        const sat = createSaturatorPlugin(this.ctx, this.chainParams.sat || {});
        const wide = createStereoWidenerPlugin(this.ctx, this.chainParams.width || {});
        const lim = createLimiterPlugin(this.ctx, this.chainParams.limiter || {});

        this.source = this.ctx.createBufferSource();
        this.source.buffer = this.buffer;

        // Bypass Logic
        this.dryGain = this.ctx.createGain();
        this.wetGain = this.ctx.createGain();

        // Initial state
        this.dryGain.gain.value = 0;
        this.wetGain.gain.value = 1;

        this.source.connect(this.dryGain);
        this.dryGain.connect(this.ctx.destination);

        this.source.connect(eq.input);
        eq.output.connect(comp.input);
        comp.output.connect(sat.input);
        comp.output.connect(sat.dryInput);
        sat.output.connect(wide.input);
        wide.output.connect(lim.input);
        lim.output.connect(this.wetGain);
        this.wetGain.connect(this.ctx.destination);

        if (this.ctx.state === 'suspended') {
            console.warn('⚠️ [LiveEngine] Forzando resume del AudioContext...');
            await this.ctx.resume();
        }
        await this.ctx.resume(); // Forzar siempre

        console.log('🔊 [LiveEngine] Reproduciendo...', { offset: startOffset, state: this.ctx.state });
        this.source.start(0, startOffset);
        this.isPlaying = true;
        this.nodes = { eq, comp, sat, wide, lim };

        this.source.onended = () => { 
            console.log('⏹️ [LiveEngine] Reproducción finalizada');
            this.isPlaying = false; 
        };
    }

    /**
     * Permite actualizar parámetros en tiempo real sin reiniciar el audio
     */
    updateParams(params) {
        if (!this.nodes || !this.ctx) return;
        const { eq, comp, sat, wide, lim } = this.nodes;

        // Update Saturation
        if (sat && params.sat !== undefined) {
            sat.setDrive(params.sat);
            sat.setMix(params.sat);
        }

        // Update Compression
        if (comp && params.comp !== undefined) {
            comp.setThreshold(-18 - (params.comp * 2.5));
            comp.setRatio(params.comp);
        }

        // Update EQ
        if (eq) {
            if (params.eqLow !== undefined) eq.setLow(params.eqLow);
            if (params.eqMid !== undefined) eq.setMid(params.eqMid);
            if (params.eqHigh !== undefined) eq.setHigh(params.eqHigh);
        }

        // Presence / Exciter
        if (eq && (params.presence !== undefined || params.exciter !== undefined)) {
            const presenceGain = (params.presence - 50) / 5;
            const exciterBoost = (params.exciter || 0) / 10;
            eq.setHigh((params.eqHigh || 0) + presenceGain + exciterBoost);
        }

        // Tape Color (Sat + Low boost)
        if (params.tape !== undefined) {
            if (sat) sat.setDrive((params.sat || 20) + (params.tape / 2));
            if (eq) eq.setLow((params.eqLow || 0) + (params.tape / 20));
        }

        // Limiter Ceiling
        if (lim && params.ceiling !== undefined) {
            lim.setCeiling(params.ceiling);
        }

        // Stereo Width
        if (wide && params.stereoWidth !== undefined) {
            wide.setWidth(params.stereoWidth);
        }
    }

    setBypass(active) {
        if (!this.ctx || !this.dryGain || !this.wetGain) return;
        const now = this.ctx.currentTime;
        if (active) {
            this.dryGain.gain.setTargetAtTime(1, now, 0.02);
            this.wetGain.gain.setTargetAtTime(0, now, 0.02);
        } else {
            this.dryGain.gain.setTargetAtTime(0, now, 0.02);
            this.wetGain.gain.setTargetAtTime(1, now, 0.02);
        }
    }

    stop() {
        try { this.source?.stop(); } catch { }
        this.isPlaying = false;
    }

    destroy() {
        this.stop();
        this.ctx?.close();
        this.ctx = null;
    }
}
