import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { audioEngine } from './AudioEngine';
import type { Song } from '../config/songs';

export class MidiPlayer {
    private part: Tone.Part | null = null;
    private listeners: ((note: string, event: 'attack' | 'release') => void)[] = [];
    private currentSong: Song | null = null;
    private totalDuration: number = 0;
    private updateInterval: number | null = null;
    private statusListeners: (() => void)[] = [];

    addListener(callback: (note: string, event: 'attack' | 'release') => void) {
        this.listeners.push(callback);
    }

    removeListener(callback: (note: string, event: 'attack' | 'release') => void) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    addStatusListener(callback: () => void) {
        this.statusListeners.push(callback);
    }

    removeStatusListener(callback: () => void) {
        this.statusListeners = this.statusListeners.filter(l => l !== callback);
    }

    private notifyStatusChange() {
        this.statusListeners.forEach(l => l());
    }

    private emit(note: string, event: 'attack' | 'release') {
        this.listeners.forEach(l => l(note, event));
    }

    getCurrentSong(): Song | null {
        return this.currentSong;
    }

    getCurrentTime(): number {
        return Tone.Transport.seconds;
    }

    getTotalDuration(): number {
        return this.totalDuration;
    }

    getCurrentBPM(): number {
        return Tone.Transport.bpm.value;
    }

    getPlaybackRate(): number {
        return Tone.Transport.bpm.value / (this.currentSong?.bpm || 120);
    }

    // Skip forward or backward by seconds
    skip(seconds: number) {
        const currentTime = Tone.Transport.seconds;
        const newTime = Math.max(0, Math.min(currentTime + seconds, this.totalDuration));
        Tone.Transport.seconds = newTime;
        this.notifyStatusChange();
    }

    // Adjust playback speed (multiplier: 0.5 = half speed, 2 = double speed)
    adjustSpeed(delta: number) {
        const currentRate = this.getPlaybackRate();
        const newRate = Math.max(0.25, Math.min(currentRate + delta, 3.0));
        const baseBPM = this.currentSong?.bpm || 120;
        Tone.Transport.bpm.value = baseBPM * newRate;
        this.notifyStatusChange();
    }

    setSpeed(rate: number) {
        const baseBPM = this.currentSong?.bpm || 120;
        Tone.Transport.bpm.value = baseBPM * Math.max(0.25, Math.min(rate, 3.0));
        this.notifyStatusChange();
    }

    async loadAndPlay(url: string, song?: Song) {
        this.stop();

        try {
            console.log(`Loading MIDI from ${url}...`);
            const midi = await Midi.fromUrl(url);

            console.log(`MIDI Loaded: ${midi.name}`);

            this.currentSong = song || null;

            // Setup Transport
            Tone.Transport.stop();
            Tone.Transport.cancel();

            // Set Tempo
            if (midi.header.tempos.length > 0) {
                Tone.Transport.bpm.value = midi.header.tempos[0].bpm;
            } else {
                Tone.Transport.bpm.value = song?.bpm || 120;
            }

            // Calculate total duration
            this.totalDuration = midi.duration;

            // Collect all notes
            const notes: any[] = [];
            midi.tracks.forEach(track => {
                track.notes.forEach(note => {
                    notes.push({
                        time: note.time,
                        note: note.name,
                        duration: note.duration,
                        velocity: note.velocity
                    });
                });
            });

            // Create Part
            this.part = new Tone.Part((time, value) => {
                // Audio
                audioEngine.scheduleNote(
                    value.note,
                    value.velocity,
                    time,
                    value.duration
                );

                // Visuals - Synced strictly to audio time
                Tone.Draw.schedule(() => {
                    this.emit(value.note, 'attack');
                }, time);

                Tone.Draw.schedule(() => {
                    this.emit(value.note, 'release');
                }, time + value.duration);

            }, notes).start(0);

            // Start Playback
            await Tone.start();
            Tone.Transport.start();
            console.log("Playback started.");

            // Start status update interval
            this.updateInterval = window.setInterval(() => {
                this.notifyStatusChange();
            }, 100);

            this.notifyStatusChange();

        } catch (error) {
            console.error("Failed to load/play MIDI:", error);
        }
    }

    stop() {
        if (this.part) {
            this.part.dispose();
            this.part = null;
        }
        if (this.updateInterval !== null) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        Tone.Transport.stop();
        Tone.Transport.cancel();
        this.currentSong = null;
        this.totalDuration = 0;
        this.notifyStatusChange();
    }

    pause() {
        Tone.Transport.pause();
        this.notifyStatusChange();
    }

    resume() {
        Tone.Transport.start();
        this.notifyStatusChange();
    }

    isPlaying(): boolean {
        return Tone.Transport.state === 'started';
    }
}

export const midiPlayer = new MidiPlayer();
