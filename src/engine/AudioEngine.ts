import * as Tone from 'tone';

export type InstrumentType = 'grand_piano' | 'upright_piano' | 'harpsichord' | 'organ' | 'synth';

class AudioEngine {
    private synth: Tone.PolySynth | null = null;
    private sampler: Tone.Sampler | null = null;
    private reverb: Tone.Reverb | null = null;
    private delay: Tone.FeedbackDelay | null = null;
    private masterGain: Tone.Gain | null = null;
    public analyser: Tone.Analyser | null = null;
    private isInitialized: boolean = false;
    private currentInstrument: InstrumentType = 'grand_piano';
    private loadedInstruments: Set<InstrumentType> = new Set();
    private isLoading: boolean = false;

    // Helper to generate chromatic map for WAV samples
    // Source: nbrosowsky/tonejs-instruments (WAV 44.1kHz)
    // Range: C1 to C8 (missing A0, B0)
    private static getPianoMap(): Record<string, string> {
        const notes = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
        const map: Record<string, string> = {};

        // Generate C1 to B7
        for (let oct = 1; oct <= 7; oct++) {
            notes.forEach(note => {
                // Key: Tone.js note (e.g., "C#4"), Value: filename (e.g., "Cs4.wav")
                const key = `${note.replace('s', '#')}${oct}`;
                map[key] = `${note}${oct}.wav`;
            });
        }
        // Add C8
        map['C8'] = 'C8.wav';

        return map;
    }

    // Sample URLs - Using high-quality WAV libraries with chromatic mapping
    private readonly SAMPLES: Record<Exclude<InstrumentType, 'synth'>, { baseUrl: string, map: Record<string, string> }> = {
        grand_piano: {
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/piano/",
            map: AudioEngine.getPianoMap()
        },
        upright_piano: {
            // Using same high-quality WAVs to avoid MP3s, indistinguishable for web use usually
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/piano/",
            map: AudioEngine.getPianoMap()
        },
        harpsichord: {
            // High quality fallback if available, or keep existing if no WAV source known.
            // Keeping existing for now but verified usage
            baseUrl: "https://gleitz.github.io/midi-js-soundfonts/MusyngKite/harpsichord-mp3/",
            map: {
                "C2": "C2.mp3", "C3": "C3.mp3", "C4": "C4.mp3", "C5": "C5.mp3", "C6": "C6.mp3"
            }
        },
        organ: {
            baseUrl: "https://raw.githubusercontent.com/nbrosowsky/tonejs-instruments/master/samples/organ/",
            map: {
                "C3": "C3.wav", "D#3": "Ds3.wav", "F#3": "Fs3.wav", "A3": "A3.wav",
                "C4": "C4.wav", "D#4": "Ds4.wav", "F#4": "Fs4.wav", "A4": "A4.wav",
                "C5": "C5.wav", "D#5": "Ds5.wav", "F#5": "Fs5.wav", "A5": "A5.wav",
                "C6": "C6.wav"
            }
        }
    };

    constructor() {
        this.masterGain = new Tone.Gain(0.7);
        this.analyser = new Tone.Analyser("fft", 256);

        // Effects chain
        this.reverb = new Tone.Reverb({
            decay: 2.5,
            wet: 0, // Disabled by default for tuning validation
            preDelay: 0.01
        });

        this.delay = new Tone.FeedbackDelay({
            delayTime: "8n.",
            feedback: 0.25,
            wet: 0
        });

        // Initialize Synth (always available fallback, simplified for stability)
        this.synth = new Tone.PolySynth(Tone.Synth, {
            volume: -10,
            oscillator: {
                type: "triangle", // Simple wave, no spread/detune
            },
            envelope: {
                attack: 0.05,
                decay: 0.2,
                sustain: 0.4,
                release: 1.2
            }
        });
    }

    async init() {
        if (this.isInitialized) return;

        await Tone.start();
        console.log("Audio Engine Started");

        if (this.masterGain && this.analyser) {
            this.masterGain.connect(this.analyser);
            this.masterGain.toDestination();

            // Reverb/Delay wiring
            if (this.reverb && this.delay) {
                this.delay.connect(this.reverb);
                this.reverb.connect(this.masterGain);
            }
        }

        // Connect Synth to chain
        if (this.synth && this.delay) {
            this.synth.connect(this.delay);
        }

        // Preload default instrument (Grand Piano)
        this.loadInstrument('grand_piano');

        this.isInitialized = true;
    }

    // Load sampler for the given instrument type
    private async loadInstrument(type: InstrumentType) {
        if (type === 'synth') {
            this.currentInstrument = 'synth';
            return;
        }

        const config = this.SAMPLES[type];
        if (!config) return;

        this.isLoading = true;
        console.log(`Loading samples for ${type}...`);

        // Create new sampler with realistic release times
        const newSampler = new Tone.Sampler({
            urls: config.map,
            baseUrl: config.baseUrl,
            // Realistic release times:
            // Piano: Natural decay kept long
            release: type === 'organ' ? 0.8 :
                type === 'harpsichord' ? 1.5 :
                    3.0,
            onload: () => {
                console.log(`${type} loaded!`);
                this.isLoading = false;
                this.loadedInstruments.add(type);

                // If this is still the selected instrument, swap it in
                if (this.currentInstrument === type) {
                    this.swapSampler(newSampler);
                }
            }
        });
    }

    private swapSampler(newSampler: Tone.Sampler) {
        if (this.sampler) {
            this.sampler.disconnect();
            this.sampler.dispose();
        }
        this.sampler = newSampler;
        if (this.delay) {
            this.sampler.connect(this.delay);
        }
    }

    async setInstrument(type: InstrumentType) {
        if (this.currentInstrument === type && !this.isLoading) return;

        // CRITICAL: Stop any playing notes
        if (this.currentInstrument === 'synth' && this.synth) {
            this.synth.releaseAll();
        } else if (this.sampler) {
            this.sampler.releaseAll();
        }

        this.currentInstrument = type;

        if (type === 'synth') {
            if (this.sampler) {
                this.sampler.releaseAll();
                setTimeout(() => this.sampler?.disconnect(), 100);
            }
            return;
        }

        await this.loadInstrument(type);
    }

    playNote(note: string, velocity: number = 0.7) {
        if (!this.isInitialized) {
            // Auto-init handled by UI interactions mostly
        }

        if (this.currentInstrument === 'synth' && this.synth) {
            this.synth.triggerAttack(note, Tone.now(), velocity);
        } else if (this.sampler && !this.isLoading) {
            this.sampler.triggerAttack(note, Tone.now(), velocity);
        }
    }

    scheduleNote(note: string, velocity: number, time: number, duration: number) {
        if (this.currentInstrument === 'synth' && this.synth) {
            this.synth.triggerAttackRelease(note, duration, time, velocity);
        } else if (this.sampler && !this.isLoading) {
            this.sampler.triggerAttackRelease(note, duration, time, velocity);
        }
    }

    stopNote(note: string) {
        if (!this.isInitialized) return;

        if (this.currentInstrument === 'synth' && this.synth) {
            this.synth.triggerRelease(note);
        } else if (this.sampler) {
            this.sampler.triggerRelease(note);
        }
    }

    updateEffect(effect: 'reverb' | 'delay', param: string, value: number) {
        if (effect === 'reverb' && this.reverb) {
            // @ts-ignore
            if (param in this.reverb) this.reverb[param] = value;
            if (param === 'wet') this.reverb.wet.value = value;
        } else if (effect === 'delay' && this.delay) {
            // @ts-ignore
            if (param in this.delay) this.delay[param] = value;
            if (param === 'wet') this.delay.wet.value = value;
        }
    }

    setReverbWet(value: number) {
        this.updateEffect('reverb', 'wet', value);
    }

    setDelayWet(value: number) {
        this.updateEffect('delay', 'wet', value);
    }
}

export const audioEngine = new AudioEngine();
