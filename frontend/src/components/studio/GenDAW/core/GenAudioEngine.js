/**
 * Gen DAW Engine 2.0 - Powered by Tone.js
 * Professional Sequencing & Audio Manipulation System.
 */

import * as Tone from 'tone';

export class GenAudioEngine {
  constructor() {
    this.initialized = false;
    this.tracks = new Map();
    this.players = new Map();
    this.synths = new Map();
    this.masterBus = null;
    this.limiter = null;
    this.reverb = null;
  }

  async init() {
    if (this.initialized) return;

    // Start Audio Context on user gesture (handled by Tone.start)
    await Tone.start();

    // Master FX Chain
    this.limiter = new Tone.Limiter(-0.5).toDestination();
    this.masterBus = new Tone.Gain(0.8).connect(this.limiter);
    
    // Global FX Returns
    this.reverb = new Tone.Reverb({
      decay: 2.5,
      preDelay: 0.1,
      wet: 0.3
    }).connect(this.masterBus);

    await this.reverb.generate();
    
    this.initialized = true;
    console.log('🎹 [GenAudioEngine] Tone.js Pro Engine Initialized');
  }

  // --- Track Management ---

  createTrack(id, name, type = 'audio') {
    const track = {
      id,
      name,
      type,
      volume: new Tone.Volume(0).connect(this.masterBus),
      mute: false,
      solo: false,
      pan: new Tone.Panner(0).connect(this.masterBus) // Simplified routing
    };

    if (type === 'synth') {
      const synth = new Tone.PolySynth(Tone.Synth).connect(track.volume);
      this.synths.set(id, synth);
    }
    
    this.tracks.set(id, track);
    return track;
  }

  // --- Audio Handling ---

  async loadClip(trackId, clipId, url) {
    const player = new Tone.Player(url).connect(this.tracks.get(trackId).volume);
    player.sync().start(0); // Sync to Transport
    this.players.set(clipId, player);
    return player;
  }

  // --- MIDI Handling ---

  scheduleNote(trackId, note, time, duration) {
    const synth = this.synths.get(trackId);
    if (!synth) return;

    Tone.Transport.schedule((t) => {
      synth.triggerAttackRelease(note, duration, t);
    }, time);
  }

  // --- Transport ---

  start() {
    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
  }

  setBpm(bpm) {
    Tone.Transport.bpm.value = bpm;
  }

  getCurrentTime() {
    return Tone.Transport.seconds;
  }

  // --- Hum-to-Music / Recording ---

  async startRecording() {
    const mic = new Tone.UserMedia();
    await mic.open();
    
    const recorder = new Tone.Recorder();
    mic.connect(recorder);
    recorder.start();
    
    return { mic, recorder };
  }

  async stopRecording(recorder, mic) {
    const blob = await recorder.stop();
    mic.close();
    return blob;
  }

  destroy() {
    this.stop();
    Tone.Transport.cancel();
    this.tracks.clear();
    this.players.forEach(p => p.dispose());
    this.synths.forEach(s => s.dispose());
    this.initialized = false;
  }
}
