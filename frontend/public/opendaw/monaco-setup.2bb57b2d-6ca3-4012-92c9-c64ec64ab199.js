import{l as e}from"./editor.main.2bb57b2d-6ca3-4012-92c9-c64ec64ab199.js";import{e as s}from"./editor.main.2bb57b2d-6ca3-4012-92c9-c64ec64ab199.js";import"./main.2bb57b2d-6ca3-4012-92c9-c64ec64ab199.js";import"./VideoOverlay.2bb57b2d-6ca3-4012-92c9-c64ec64ab199.js";const r=`type bipolar = number;

type int = number;

type float = number;

type Nullable<T> = T | null;

type ppqn = number;

type Sample = z.infer<typeof Sample>;

type unitValue = number;

declare const Interpolation: {
    readonly None: {
        readonly type: "none";
    };
    readonly Linear: {
        readonly type: "linear";
    };
    readonly Curve: (slope: unitValue) => {
        readonly type: "linear";
    } | {
        readonly type: "curve";
        readonly slope: number;
    };
};

declare enum ClassicWaveform {
    sine = 0,
    triangle = 1,
    saw = 2,
    square = 3
}

declare enum VoicingMode {
    Monophonic = 0,
    Polyphonic = 1
}

type Procedure<T> = (value: T) => void;

declare namespace AudioData {
    const count: () => number;
    const create: (sampleRate: number, numberOfFrames: number, numberOfChannels: number) => AudioData;
}

declare namespace Chord {
    const Major: ReadonlyArray<int>;
    const Minor: ReadonlyArray<int>;
    const Minor7: ReadonlyArray<int>;
    const Minor9: ReadonlyArray<int>;
    const Dominant7: ReadonlyArray<int>;
    const NoteLabels: string[];
    const compile: (scale: ReadonlyArray<int>, root: int, variation: int, n: int) => ReadonlyArray<int>;
    const toString: (midiNote: int) => string;
}

declare class FFT {
    #private;
    static reverse(i: int): number;
    constructor(n: int);
    process(real: Float32Array, imag: Float32Array): void;
    inverse(real: Float32Array, imag: Float32Array): void;
}

declare const PPQN: {
    readonly Bar: number;
    readonly Quarter: 960;
    readonly SemiQuaver: number;
    readonly fromSignature: (nominator: int, denominator: int) => number;
    readonly toParts: (ppqn: ppqn, nominator?: int, denominator?: int) => {
        readonly bars: number;
        readonly beats: number;
        readonly semiquavers: number;
        readonly ticks: number;
    };
    readonly secondsToPulses: (seconds: seconds, bpm: bpm) => ppqn;
    readonly pulsesToSeconds: (pulses: ppqn, bpm: bpm) => seconds;
    readonly secondsToBpm: (seconds: seconds, pulses: ppqn) => bpm;
    readonly samplesToPulses: (samples: samples, bpm: bpm, sampleRate: number) => ppqn;
    readonly pulsesToSamples: (pulses: ppqn, bpm: bpm, sampleRate: number) => number;
    readonly toString: (pulses: ppqn, nominator?: int, denominator?: int) => string;
};

declare const midiToHz: (note?: number, baseFrequency?: number) => number;

declare const dbToGain: (db: number) => number;

declare const gainToDb: (gain: number) => number;

declare enum ClassicWaveform {
    sine = 0,
    triangle = 1,
    saw = 2,
    square = 3
}

type Procedure<T> = (value: T) => void;

type Sample = z.infer<typeof Sample>;

declare enum VoicingMode {
    Monophonic = 0,
    Polyphonic = 1
}

enum AudioPlayback {
    NoWarp = 0,
    PitchStretch = 1
}

type Send = {
    /** Send amount in decibels */
    amount: number;
    /** Pan position for the Send (-1.0 = left, 0.0 = center, 1.0 = right) */
    pan: bipolar;
    /** Send routing mode (pre-fader or post-fader) */
    mode: "pre" | "post";
};

interface Sendable {
    /**
     * Add a Send to an auxiliary or group unit
     * @param target - The destination unit for the Send
     * @param props - Send configuration ({@link Send})
     */
    addSend(target: AuxAudioUnit | GroupAudioUnit, props?: Partial<Send>): Send;
    /** Remove an existing Send */
    removeSend(send: Send): void;
}

type AnyDevice = MIDIEffects[keyof MIDIEffects] | AudioEffects[keyof AudioEffects] | Instruments[keyof Instruments] | AudioUnit;

interface Effect {
    /** Enable or bypass the effect */
    enabled: boolean;
    /** Custom label for the effect */
    label: string;
}

interface AudioEffect extends Effect {
    /** Effect type identifier */
    readonly key: keyof AudioEffects;
}

interface DelayEffect extends AudioEffect {
    // Pre-delay Left
    /** Pre-delay left sync time index (0-11): Off, 1/16, 1/12, 1/8, 1/6, 3/16, 1/4, 5/16, 1/3, 3/8, 7/16, 1/2 */
    preSyncTimeLeft: number;
    /** Pre-delay left milliseconds offset (0-500 ms) */
    preMillisTimeLeft: number;
    // Pre-delay Right
    /** Pre-delay right sync time index (0-11): Off, 1/16, 1/12, 1/8, 1/6, 3/16, 1/4, 5/16, 1/3, 3/8, 7/16, 1/2 */
    preSyncTimeRight: number;
    /** Pre-delay right milliseconds offset (0-500 ms) */
    preMillisTimeRight: number;
    // Main Delay
    /** Delay time index (0-16): 1/1, 1/2, 1/3, 1/4, 3/16, 1/6, 1/8, 3/32, 1/12, 1/16, 3/64, 1/24, 1/32, 1/48, 1/64, 1/96, 1/128 note fractions */
    delay: number;
    /** Additional delay time in milliseconds (0-500 ms) */
    millisTime: number;
    /** Feedback amount (0.0 to 1.0) */
    feedback: number;
    /** Cross-feedback amount (0.0 to 1.0) */
    cross: number;
    /** LFO speed in Hz (0.1 to 25) */
    lfoSpeed: number;
    /** LFO depth in milliseconds (0-50 ms) */
    lfoDepth: number;
    /** Filter cutoff (-1.0 = lowpass, 0.0 = off, 1.0 = highpass) */
    filter: number;
    // Mix
    /** Dry (original) signal level in dB */
    dry: number;
    /** Wet (processed) signal level in dB */
    wet: number;
}

interface AudioEffects {
    "delay": DelayEffect;
}

interface MIDIEffect extends Effect {
    /** Effect type identifier */
    readonly key: keyof MIDIEffects;
}

interface PitchEffect extends MIDIEffect {
    /** Pitch shift in octaves */
    octaves: int;
    /** Pitch shift in semitones */
    semiTones: int;
    /** Fine pitch shift in cents (100 cents = 1 semitone) */
    cents: float;
}

interface MIDIEffects {
    "pitch": PitchEffect;
}

interface AudioUnit {
    /** Output routing destination, if unset it goes to primary output, if null, it remains unplugged */
    output?: Nullable<OutputAudioUnit | GroupAudioUnit>;
    /** Volume in decibels (dB) */
    volume: number;
    /** Pan position (-1.0 = full left, 0.0 = center, 1.0 = full right) */
    panning: bipolar;
    /** Mute the audio unit */
    mute: boolean;
    /** Solo the audio unit */
    solo: boolean;
    /** Add an audio effect to the unit */
    addAudioEffect<T extends keyof AudioEffects>(type: T, props?: Partial<AudioEffects[T]>): AudioEffects[T];
    /** Add a MIDI effect to the unit */
    addMIDIEffect<T extends keyof MIDIEffects>(type: T, props?: Partial<MIDIEffects[T]>): MIDIEffects[T];
    /** Add a note track for MIDI events */
    addNoteTrack(props?: Partial<Pick<Track, "enabled">>): NoteTrack;
    /** Add an audio track */
    addAudioTrack(props?: Partial<Pick<Track, "enabled">>): AudioTrack;
    /** Add an automation track for parameter changes */
    addValueTrack<DEVICE extends AnyDevice, PARAMETER extends keyof DEVICE>(device: DEVICE, parameter: PARAMETER, props?: Partial<Pick<Track, "enabled">>): ValueTrack;
}

interface InstrumentAudioUnit extends AudioUnit, Sendable {
    /** Unit type identifier */
    readonly kind: "instrument";
    /** The instrument instance */
    readonly instrument: Instrument;
    /** Change the instrument type */
    setInstrument(name: keyof Instruments): Instrument;
}

interface AuxAudioUnit extends AudioUnit, Sendable {
    /** Unit type identifier */
    readonly kind: "auxiliary";
    /** Custom label for the auxiliary unit */
    label: string;
}

interface GroupAudioUnit extends AudioUnit, Sendable {
    /** Unit type identifier */
    readonly kind: "group";
    /** Custom label for the group unit */
    label: string;
}

interface OutputAudioUnit extends AudioUnit {
    /** Unit type identifier */
    readonly kind: "output";
}

interface Track {
    /** The audio unit this track belongs to */
    readonly audioUnit: AudioUnit;
    /** Enable or disable the track */
    enabled: boolean;
}

interface Region {
    /** Start position in PPQN */
    position: ppqn;
    /** Length in PPQN */
    duration: ppqn;
    /** Mute the region */
    mute: boolean;
    /** Custom label for the region */
    label: string;
    /** Color hue (0-360) */
    hue: int;
}

interface LoopableRegion extends Region {
    /** Loop cycle length in PPQN */
    loopDuration: ppqn;
    /** Loop start offset in PPQN */
    loopOffset: ppqn;
}

interface NoteEvent {
    /** Start position in PPQN */
    position: ppqn;
    /** Note length in PPQN */
    duration: ppqn;
    /** MIDI pitch (0-127, where 60 = middle C) */
    pitch: number;
    /** Fine-tuning in cents (-100 to +100) */
    cents: number;
    /** Note velocity (0.0 to 1.0) */
    velocity: number;
}

interface NoteRegion extends LoopableRegion {
    /** The note track this region belongs to */
    readonly track: NoteTrack;
    /** Add a MIDI note event to the region */
    addEvent(props?: Partial<NoteEvent>): NoteEvent;
    addEvents(events: Array<Partial<NoteEvent>>): void;
}

type NoteRegionProps = Partial<NoteRegion & {
    mirror: NoteRegion;
}>;

interface NoteTrack extends Track {
    /** Add a note region to the track */
    addRegion(props?: NoteRegionProps): NoteRegion;
}

interface AudioRegion extends LoopableRegion {
    /** The audio track this region belongs to */
    readonly track: AudioTrack;
    /** NoSync is not dependent on the tempo. Pass seconds for duration, loopOffset and loopDuration! **/
    playback: AudioPlayback;
}

interface AudioTrack extends Track {
    /** Add an audio region to the track */
    addRegion(sample: Sample, props?: Partial<AudioRegion>): AudioRegion;
}

interface ValueEvent {
    /** Position in PPQN */
    position: ppqn;
    /** Parameter value (0.0 to 1.0) */
    value: unitValue;
    /** Interpolation curve type */
    interpolation: Interpolation;
}

interface ValueRegion extends LoopableRegion {
    /** The automation track this region belongs to */
    readonly track: ValueTrack;
    /** Add an automation point to the region */
    addEvent(props?: Partial<ValueEvent>): ValueEvent;
    addEvents(events: Array<Partial<ValueEvent>>): void;
}

type ValueRegionProps = Partial<ValueRegion & {
    mirror: ValueRegion;
}>;

interface ValueTrack extends Track {
    /** Add an automation region to the track */
    addRegion(props?: ValueRegionProps): ValueRegion;
}

interface Instrument {
    /** The audio unit this instrument belongs to */
    readonly audioUnit: InstrumentAudioUnit;
}

interface MIDIInstrument extends Instrument {
}

interface AudioInstrument extends Instrument {
}

/** Vaporisateur oscillator configuration */
interface VaporisateurOscillator {
    /** Waveform type (sine, triangle, saw, square) */
    waveform: ClassicWaveform;
    /** Volume in decibels */
    volume: number;
    /** Octave offset (-3 to 3) */
    octave: int;
    /** Fine-tuning in cents (-1200 to 1200) */
    tune: float;
}

/** Vaporisateur LFO configuration */
interface VaporisateurLFO {
    /** LFO waveform type (sine, triangle, saw, square) */
    waveform: ClassicWaveform;
    /** LFO rate in Hz (0.0001 to 30) */
    rate: float;
    /** Sync LFO to tempo */
    sync: boolean;
    /** LFO modulation amount to pitch (-1.0 to 1.0) */
    targetTune: bipolar;
    /** LFO modulation amount to filter cutoff (-1.0 to 1.0) */
    targetCutoff: bipolar;
    /** LFO modulation amount to volume (-1.0 to 1.0) */
    targetVolume: bipolar;
}

/** Vaporisateur noise generator configuration */
interface VaporisateurNoise {
    /** Attack time in seconds (0.001 to 5.0) */
    attack: float;
    /** Hold time in seconds (0.001 to 5.0) */
    hold: float;
    /** Release time in seconds (0.001 to 5.0) */
    release: float;
    /** Volume in decibels */
    volume: number;
}

/** Classic subtractive synthesizer instrument */
interface Vaporisateur extends MIDIInstrument {
    /** Filter cutoff frequency in Hz (20 to 20000) */
    cutoff: float;
    /** Filter resonance (0.01 to 10.0) */
    resonance: float;
    /** Filter order/poles (1, 2, 3 or 4) */
    filterOrder: 1 | 2 | 3 | 4;
    /** Filter envelope modulation amount (-1.0 to 1.0) */
    filterEnvelope: bipolar;
    /** Filter keyboard tracking amount (-1.0 to 1.0) */
    filterKeyboard: bipolar;
    /** Amplitude envelope attack time in seconds (0.001 to 5.0) */
    attack: float;
    /** Amplitude envelope decay time in seconds (0.001 to 5.0) */
    decay: float;
    /** Amplitude envelope sustain level (0.0 to 1.0) */
    sustain: unitValue;
    /** Amplitude envelope release time in seconds (0.001 to 5.0) */
    release: float;
    /** Voice mode (monophonic or polyphonic) */
    voicingMode: VoicingMode;
    /** Glide/portamento time (0.0 to 1.0) */
    glideTime: unitValue;
    /** Number of unison voices (1, 3 or 5) */
    unisonCount: 1 | 3 | 5;
    /** Unison detune amount in cents (1 to 1200) */
    unisonDetune: float;
    /** Unison stereo spread (0.0 to 1.0) */
    unisonStereo: unitValue;
    /** LFO configuration */
    lfo: VaporisateurLFO;
    /** Two oscillators */
    oscillators: [
        VaporisateurOscillator,
        VaporisateurOscillator
    ];
    /** Noise generator configuration */
    noise: VaporisateurNoise;
}

/** Sample-based playback instrument */
interface Playfield extends MIDIInstrument {
}

/** Minimal synthesizer instrument */
interface Nano extends MIDIInstrument {
    sample: Sample;
}

/** SoundFont (.sf2) player instrument */
interface Soundfont extends MIDIInstrument {
}

/** External MIDI output instrument */
interface MIDIOutput extends MIDIInstrument {
}

interface Tape extends AudioInstrument {
}

type Instruments = {
    "Vaporisateur": Vaporisateur;
    "Playfield": Playfield;
    "Nano": Nano;
    "Soundfont": Soundfont;
    "MIDIOutput": MIDIOutput;
    "Tape": Tape;
};

interface Project {
    /** Master output audio unit */
    readonly output: OutputAudioUnit;
    /** Project name */
    name: string;
    /** Tempo in beats per minute */
    bpm: number;
    /** Time signature (e.g., 4/4, 3/4) */
    timeSignature: {
        numerator: int;
        denominator: int;
    };
    /** Add an instrument track to the project */
    addInstrumentUnit<KEY extends keyof Instruments>(name: KEY, constructor?: Procedure<Instruments[KEY]>): InstrumentAudioUnit;
    /** Add an auxiliary effects track */
    addAuxUnit(props?: Partial<Pick<AuxAudioUnit, "label">>): AuxAudioUnit;
    /** Add a group track for mixing multiple units */
    addGroupUnit(props?: Partial<Pick<GroupAudioUnit, "label">>): GroupAudioUnit;
    /** Open the project in the studio and exit */
    openInStudio(): void;
}

interface Api {
    /** Create a new project */
    newProject(name?: string): Project;
    /** Get the current active project */
    getProject(): Promise<Project>;
    /** Creates a sample in the studio **/
    addSample(data: AudioData, name: string): Promise<Sample>;
}

declare const openDAW: Api

declare const sampleRate: number`,t=`// noinspection JSUnusedGlobalSymbols

declare class TypedArray {
    readonly buffer: ArrayBuffer
    readonly byteOffset: number
    readonly byteLength: number
    readonly length: number
    [index: number]: number | bigint
    copyWithin(target: number, start: number, end?: number): this
    every(callbackfn: (value: any, index: number, array: this) => boolean): boolean
    fill(value: any, start?: number, end?: number): this
    filter(callbackfn: (value: any, index: number, array: this) => boolean): this
    find(callbackfn: (value: any, index: number, array: this) => boolean): any
    findIndex(callbackfn: (value: any, index: number, array: this) => boolean): number
    forEach(callbackfn: (value: any, index: number, array: this) => void): void
    includes(value: any, fromIndex?: number): boolean
    indexOf(value: any, fromIndex?: number): number
    join(separator?: string): string
    lastIndexOf(value: any, fromIndex?: number): number
    map(callbackfn: (value: any, index: number, array: this) => any): this
    reduce(callbackfn: (prev: any, curr: any, index: number, array: this) => any): any
    reduceRight(callbackfn: (prev: any, curr: any, index: number, array: this) => any): any
    reverse(): this
    set(array: ArrayLike<any>, offset?: number): void
    slice(start?: number, end?: number): this
    some(callbackfn: (value: any, index: number, array: this) => boolean): boolean
    sort(compareFn?: (a: any, b: any) => number): this
    subarray(begin?: number, end?: number): this
    toLocaleString(): string
    toString(): string
    values(): IterableIterator<any>
    keys(): IterableIterator<number>
    entries(): IterableIterator<[number, any]>
    [Symbol.iterator](): IterableIterator<any>
}

declare class Int8Array extends TypedArray {
    [index: number]: number
    constructor(length: number)
    constructor(array: ArrayLike<number> | ArrayBuffer)
}

declare class Uint8Array extends TypedArray {
    [index: number]: number;
    constructor(length: number);
    constructor(array: ArrayLike<number> | ArrayBuffer)
}

declare class Uint8ClampedArray extends TypedArray {
    [index: number]: number;
    constructor(length: number);
    constructor(array: ArrayLike<number> | ArrayBuffer)
}

declare class Int16Array extends TypedArray {
    [index: number]: number;
    constructor(length: number);
    constructor(array: ArrayLike<number> | ArrayBuffer)
}

declare class Uint16Array extends TypedArray {
    [index: number]: number;
    constructor(length: number);
    constructor(array: ArrayLike<number> | ArrayBuffer)
}

declare class Int32Array extends TypedArray {
    [index: number]: number;
    constructor(length: number);
    constructor(array: ArrayLike<number> | ArrayBuffer)
}

declare class Uint32Array extends TypedArray {
    [index: number]: number;
    constructor(length: number);
    constructor(array: ArrayLike<number> | ArrayBuffer)
}

declare class Float32Array extends TypedArray {
    [index: number]: number;
    constructor(length: number);
    constructor(array: ArrayLike<number> | ArrayBuffer)
}

declare class Float64Array extends TypedArray {
    [index: number]: number;
    constructor(length: number);
    constructor(array: ArrayLike<number> | ArrayBuffer)
}

declare class BigInt64Array extends TypedArray {
    [index: number]: bigint;
    constructor(length: number);
    constructor(array: ArrayLike<bigint> | ArrayBuffer)
}

declare class BigUint64Array extends TypedArray {
    [index: number]: bigint;
    constructor(length: number);
    constructor(array: ArrayLike<bigint> | ArrayBuffer)
}

declare class Array<T> {
    readonly length: number
    [index: number]: T

    constructor()
    constructor(length: number)
    constructor(...items: T[])

    at(index: number): T | undefined
    concat(...items: (T | ConcatArray<T>)[]): T[]
    copyWithin(target: number, start: number, end?: number): this
    entries(): IterableIterator<[number, T]>
    every(callbackfn: (value: T, index: number, array: T[]) => boolean): boolean
    fill(value: T, start?: number, end?: number): this
    filter(callbackfn: (value: T, index: number, array: T[]) => boolean): T[]
    find(callbackfn: (value: T, index: number, array: T[]) => boolean): T | undefined
    findIndex(callbackfn: (value: T, index: number, array: T[]) => boolean): number
    flat<U>(this: U[][], depth?: number): U[]
    flatMap<U>(callbackfn: (value: T, index: number, array: T[]) => U | readonly U[]): U[]
    forEach(callbackfn: (value: T, index: number, array: T[]) => void): void
    includes(value: T, fromIndex?: number): boolean
    indexOf(value: T, fromIndex?: number): number
    join(separator?: string): string
    keys(): IterableIterator<number>
    lastIndexOf(value: T, fromIndex?: number): number
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[]
    pop(): T | undefined
    push(...items: T[]): number
    reduce(callbackfn: (prev: T, curr: T, index: number, array: T[]) => T): T
    reduceRight(callbackfn: (prev: T, curr: T, index: number, array: T[]) => T): T
    reverse(): this
    shift(): T | undefined
    slice(start?: number, end?: number): T[]
    some(callbackfn: (value: T, index: number, array: T[]) => boolean): boolean
    sort(compareFn?: (a: T, b: T) => number): this
    splice(start: number, deleteCount?: number, ...items: T[]): T[]
    toLocaleString(): string
    toString(): string
    unshift(...items: T[]): number
    values(): IterableIterator<T>
    [Symbol.iterator](): IterableIterator<T>
    [Symbol.unscopables](): Record<string, boolean>
}

interface ConcatArray<T> {
    readonly length: number
    [n: number]: T
    concat(...items: ConcatArray<T>[]): T[]
}

interface PromiseConstructor {
    readonly prototype: Promise<unknown>;
    new<T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
    all<T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>;
    race<T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;
    reject<T = never>(reason?: any): Promise<T>;
    resolve(): Promise<void>;
    resolve<T>(value: T): Promise<Awaited<T>>;
    resolve<T>(value: T | PromiseLike<T>): Promise<Awaited<T>>;
}

declare var Promise: PromiseConstructor

declare function setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
declare function setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;

interface IteratorYieldResult<TYield> {
    done?: false
    value: TYield
}

interface IteratorReturnResult<TReturn> {
    done: true
    value: TReturn
}

type IteratorResult<T, TReturn = any> = IteratorYieldResult<T> | IteratorReturnResult<TReturn>

interface Iterator<T, TReturn = any, TNext = undefined> {
    next(...args: [] | [TNext]): IteratorResult<T, TReturn>
    return?(value?: TReturn): IteratorResult<T, TReturn>
    throw?(e?: any): IteratorResult<T, TReturn>
}

interface Iterable<T> {
    [Symbol.iterator](): Iterator<T>
}

interface IterableIterator<T> extends Iterator<T> {
    [Symbol.iterator](): IterableIterator<T>
}

interface SymbolConstructor {
    readonly iterator: symbol
    readonly unscopables: symbol
}

declare var Symbol: SymbolConstructor

type Partial<T> = { [P in keyof T]?: T[P] }
type Required<T> = { [P in keyof T]-?: T[P] }
type Readonly<T> = { readonly [P in keyof T]: T[P] }
type Pick<T, K extends keyof T> = { [P in K]: T[P] }
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
type Record<K extends keyof any, T> = { [P in K]: T }
type Exclude<T, U> = T extends U ? never : T
type Extract<T, U> = T extends U ? T : never
type NonNullable<T> = T extends null | undefined ? never : T
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never
type Awaited<T> = T extends null | undefined ? T : T extends object & {
    then(onfulfilled: infer F, ...args: infer _): any
} ? F extends ((value: infer V, ...args: infer _) => any) ? Awaited<V> : never : T

interface ReadonlyArray<T> {
    readonly length: number
    readonly [n: number]: T
    concat(...items: (T | ConcatArray<T>)[]): T[]
    every(callbackfn: (value: T, index: number, array: readonly T[]) => boolean): boolean
    filter(callbackfn: (value: T, index: number, array: readonly T[]) => boolean): T[]
    find(callbackfn: (value: T, index: number, array: readonly T[]) => boolean): T | undefined
    findIndex(callbackfn: (value: T, index: number, array: readonly T[]) => boolean): number
    forEach(callbackfn: (value: T, index: number, array: readonly T[]) => void): void
    includes(value: T, fromIndex?: number): boolean
    indexOf(value: T, fromIndex?: number): number
    join(separator?: string): string
    lastIndexOf(value: T, fromIndex?: number): number
    map<U>(callbackfn: (value: T, index: number, array: readonly T[]) => U): U[]
    reduce(callbackfn: (prev: T, curr: T, index: number, array: readonly T[]) => T): T
    reduceRight(callbackfn: (prev: T, curr: T, index: number, array: readonly T[]) => T): T
    slice(start?: number, end?: number): T[]
    some(callbackfn: (value: T, index: number, array: readonly T[]) => boolean): boolean
    [Symbol.iterator](): IterableIterator<T>
}`,n=e.typescript.typescriptDefaults;n.setEagerModelSync(!0);n.setCompilerOptions({target:e.typescript.ScriptTarget.ES2020,module:e.typescript.ModuleKind.ESNext,moduleResolution:e.typescript.ModuleResolutionKind.NodeJs,allowJs:!0,noLib:!0,checkJs:!1,strict:!0,jsx:e.typescript.JsxEmit.Preserve,noEmit:!1,esModuleInterop:!0,allowSyntheticDefaultImports:!0});n.setDiagnosticsOptions({noSemanticValidation:!1,noSyntaxValidation:!1,noSuggestionDiagnostics:!1,onlyVisible:!1,diagnosticCodesToIgnore:[]});n.addExtraLib(t,"file:///library.d.ts");n.addExtraLib(r,"ts:opendaw.d.ts");n.addExtraLib(`
declare const console: Console
declare const Math: Math
`,"ts:libs.d.ts");export{s as monaco};
//# sourceMappingURL=monaco-setup.2bb57b2d-6ca3-4012-92c9-c64ec64ab199.js.map
