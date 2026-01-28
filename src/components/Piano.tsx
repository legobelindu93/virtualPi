import { useState, useEffect, useCallback, useRef } from 'react';
import { generateKeyboard, getNoteId } from '../utils/music';
import type { KeyData } from '../utils/music';
import { audioEngine } from '../engine/AudioEngine';
import { midiPlayer } from '../engine/MidiPlayer';
import { PIANO_CONFIG } from '../config/piano';
import { KEY_MAPPINGS } from '../config/key_mappings';
import './Piano.css';
import type { VisualMode } from '../App';
import SynthesiaCanvas from './SynthesiaCanvas';

interface PianoProps {
    startOctave?: number;
    endOctave?: number;
    isPlayingDemo: boolean;
    // Settings
    showLabels: boolean;
    // Visuals
    visualColor: string;
    colorMode?: 'single' | 'rainbow';
    visualMode: VisualMode;
    visualEffect?: 'none' | 'fire' | 'electric';
    // Sustain Pedal
    sustainPedal: boolean;
    // Note Trail Settings
    noteTrailOpacity?: number;
    noteTrailWidth?: number;
    noteTrailSpeed?: number;
    noteTrailGradient?: boolean;
    noteTrailGlow?: boolean;
}

const keys = generateKeyboard(PIANO_CONFIG.startOctave, PIANO_CONFIG.endOctave);

export default function Piano({ showLabels, visualColor, colorMode = 'single', visualMode, visualEffect = 'none', sustainPedal,
    noteTrailOpacity = 0.8, noteTrailWidth = 0.9, noteTrailSpeed = 5, noteTrailGradient = true, noteTrailGlow = true
}: PianoProps) {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
    const [isMouseDown, setIsMouseDown] = useState(false);
    const pianoContainerRef = useRef<HTMLDivElement>(null);

    // Subscribe to MIDI Player events for visualization
    useEffect(() => {
        const handleMidiEvent = (note: string, event: 'attack' | 'release') => {
            setActiveNotes(prev => {
                const next = new Set(prev);
                // Simple normalisation: ensure we match our key IDs (mostly sharps)
                // Tone.Midi might return sharps, but just in case
                const normalizedNote = note.replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#');

                if (event === 'attack') {
                    next.add(normalizedNote);
                } else {
                    next.delete(normalizedNote);
                }
                return next;
            });
        };

        midiPlayer.addListener(handleMidiEvent);
        return () => midiPlayer.removeListener(handleMidiEvent);
    }, []);

    // Track notes that should be sustained
    const sustainedNotes = useRef<Set<string>>(new Set());

    // Center scroll on C4 initially
    useEffect(() => {
        if (pianoContainerRef.current) {
            // Approximate center: C4 is around index 40
            const scrollX = 40 * PIANO_CONFIG.whiteKeyWidth - window.innerWidth / 2;
            pianoContainerRef.current.scrollLeft = scrollX;
        }
    }, []);

    // Play Note - optimized with functional state to avoid dependency issues if called rapidly
    const play = useCallback((noteId: string) => {
        setActiveNotes(prev => {
            if (!prev.has(noteId)) {
                audioEngine.playNote(noteId);
                const next = new Set(prev);
                next.add(noteId);
                return next;
            }
            return prev;
        });
    }, []);

    const stop = useCallback((noteId: string) => {
        // If sustain pedal is active, DON'T stop the note - just mark it as "released but sustained"
        if (sustainPedal) {
            // Add to sustained notes list (will be stopped when pedal is released)
            sustainedNotes.current.add(noteId);
            // Remove from active notes visually, but DON'T stop the audio
            setActiveNotes(prev => {
                const next = new Set(prev);
                next.delete(noteId);
                return next;
            });
        } else {
            // Normal behavior: stop the note immediately
            audioEngine.stopNote(noteId);
            setActiveNotes(prev => {
                const next = new Set(prev);
                next.delete(noteId);
                return next;
            });
        }
    }, [sustainPedal]);

    // When sustain pedal is released, stop all sustained notes with fade out
    useEffect(() => {
        if (!sustainPedal && sustainedNotes.current.size > 0) {
            // Stop all notes that were being sustained
            sustainedNotes.current.forEach(noteId => {
                audioEngine.stopNote(noteId); // This will use the natural release envelope
            });
            sustainedNotes.current.clear();
        }
    }, [sustainPedal]);

    const handleMouseDown = (noteId: string) => {
        setIsMouseDown(true);
        play(noteId);
    };
    const handleMouseUp = (noteId: string) => { stop(noteId); };
    const handleMouseEnter = (noteId: string) => { if (isMouseDown) play(noteId); };
    const handleMouseLeave = (noteId: string) => { if (isMouseDown) stop(noteId); };

    const [keyLabels, setKeyLabels] = useState<Record<string, string>>({});

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsMouseDown(false);

        // Build key map from config
        const keyMap: Record<string, string> = {};
        const labels: Record<string, string> = {};

        // Use FULL mapping
        Object.entries(KEY_MAPPINGS.FULL).forEach(([note, keyChord]) => {
            keyMap[keyChord] = note;
            // For label, strip 'ctrl+' and uppercase
            labels[note] = keyChord.replace('ctrl+', '').toUpperCase();
        });
        setKeyLabels(labels);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            // Strict Input Check: Allow normal typing in Inputs/TextAreas
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            const keyId = (e.ctrlKey ? 'ctrl+' : '') + e.key;
            const note = keyMap[keyId];

            // 1. CRITICAL: Global Capture & Block Defaults for Mapped Keys
            if (note) {
                // Prevent EVERYTHING: Scroll, Zoom, Tab Switching, Refresh (if browser allows)
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation(); // Ensure we own this event

                audioEngine.init();
                play(note);
                return;
            }

            // 2. Block potentially dangerous navigation keys even if not mapped?
            // User requested "Pour CHAQUE touche utilisée par le piano", but ensuring stability means
            // blocking strictly known "dangerous" keys during performance might be wise.
            // However, we'll stick to strict map compliance plus standard "Game" keys.
            const blockedDefaults = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
            if (blockedDefaults.includes(e.code) || blockedDefaults.includes(e.key)) {
                e.preventDefault();
                // Space is handled in App.tsx for sustain, but we prevent scroll here too just in case
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const keyId = (e.ctrlKey ? 'ctrl+' : '') + e.key;
            const note = keyMap[keyId];
            if (note) {
                e.preventDefault();
                e.stopPropagation();
                stop(note);
            }
        };

        // Block Zooming via Wheel
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        // Passive: false required to block wheel
        window.addEventListener('wheel', handleWheel, { passive: false });

        // Capture Phase is CRITICAL to intercept before browser shortcuts
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
        };
    }, [play, stop]);

    const whiteKeys = keys.filter(k => !k.isSharp);
    const blackKeys = keys.filter(k => k.isSharp);
    const whiteKeyWidth = PIANO_CONFIG.whiteKeyWidth;
    const blackKeyWidth = PIANO_CONFIG.blackKeyWidth;

    const getBlackKeyPosition = (key: KeyData) => {
        const baseNote = key.note.replace('#', '');
        const whiteKeyIndex = whiteKeys.findIndex(k => k.note === baseNote && k.octave === key.octave);
        if (whiteKeyIndex === -1) return 0;
        return (whiteKeyIndex + 1) * whiteKeyWidth - (blackKeyWidth / 2);
    };

    // Ensure audio starts on click
    const handleRawMouseDown = (noteId: string) => {
        audioEngine.init();
        handleMouseDown(noteId);
    }

    return (
        // Main Container Scrollable
        <div className="piano-scroll-container" ref={pianoContainerRef}>

            {/* The "Game World" Wrapper inside scroll */}
            <div className="game-world" style={{
                // Explicit pixel width for scrolling
                width: `${whiteKeys.length * whiteKeyWidth}px`,
                position: 'relative',
                height: '100%'
            }}>
                {/* Visual Canvas Overlay */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 'calc(100% - 200px)', zIndex: 5, pointerEvents: 'none' }}>
                    <SynthesiaCanvas
                        activeNotes={activeNotes}
                        visualMode={visualMode}
                        // @ts-ignore - visualColor prop to be added next
                        visualColor={visualColor}
                        colorMode={colorMode}
                        visualEffect={visualEffect}
                        particlesEnabled={true}
                        // Note Trail Settings
                        noteTrailOpacity={noteTrailOpacity}
                        noteTrailWidth={noteTrailWidth}
                        noteTrailSpeed={noteTrailSpeed}
                        noteTrailGradient={noteTrailGradient}
                        noteTrailGlow={noteTrailGlow}
                    />
                </div>

                {/* Keys Container */}
                <div className="keys-layer">
                    {/* Render White Keys */}
                    {whiteKeys.map((key, index) => {
                        const noteId = getNoteId(key.note, key.octave);
                        const isActive = activeNotes.has(noteId);
                        return (
                            <Key
                                key={noteId}
                                data={key}
                                isBlack={false}
                                isActive={isActive}
                                showLabels={showLabels}
                                label={keyLabels[noteId] || ''}
                                // onMouseDown={() => handleRawMouseDown(noteId)}
                                onMouseDown={handleRawMouseDown.bind(null, noteId)}
                                onMouseUp={() => handleMouseUp(noteId)}
                                onMouseEnter={() => handleMouseEnter(noteId)}
                                onMouseLeave={() => handleMouseLeave(noteId)}
                                style={{
                                    left: `${index * whiteKeyWidth}px`,
                                    width: `${whiteKeyWidth}px`,
                                    height: '100%' // Full height
                                }}
                            />
                        );
                    })}
                    {/* Render Black Keys */}
                    {blackKeys.map((key) => {
                        const noteId = getNoteId(key.note, key.octave);
                        const isActive = activeNotes.has(noteId);
                        const leftPos = getBlackKeyPosition(key);
                        return (
                            <Key
                                key={noteId}
                                data={key}
                                isBlack={true}
                                isActive={isActive}
                                showLabels={showLabels}
                                label={keyLabels[noteId] || ''}
                                // onMouseDown={() => handleRawMouseDown(noteId)}
                                onMouseDown={handleRawMouseDown.bind(null, noteId)}
                                onMouseUp={() => handleMouseUp(noteId)}
                                onMouseEnter={() => handleMouseEnter(noteId)}
                                onMouseLeave={() => handleMouseLeave(noteId)}
                                style={{
                                    left: `${leftPos}px`,
                                    width: `${blackKeyWidth}px`,
                                    height: '60%',
                                    zIndex: 10
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function Key({ isBlack, isActive, showLabels, label, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, style }: any) {
    // Show label if enabled. 
    // Prioritize mapped key label. If no map, maybe show note? User asked for mapping config.
    // If showLabels is true, we always try to show something useful.

    return (
        <div
            className={`piano-key ${isBlack ? 'black' : 'white'} ${isActive ? 'active' : ''}`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onDragStart={(e) => e.preventDefault()}
            style={style}
        >
            <div className={`key-highlight ${isActive ? 'show' : ''}`} />
            {showLabels && label && (
                <span className="key-label" style={{
                    bottom: isBlack ? '10px' : '20px',
                    color: isBlack ? '#fff' : '#555',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                }}>
                    {label}
                </span>
            )}
        </div>
    );
}
