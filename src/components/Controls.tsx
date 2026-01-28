import { useState, useEffect } from 'react';
import { Volume2, Music, Settings, PlayCircle, PauseCircle, Sliders, SkipBack, SkipForward, Gauge, GaugeCircle, Footprints } from 'lucide-react';
import * as Tone from 'tone';
import './Controls.css';

import type { InstrumentType } from '../engine/AudioEngine';
import InstrumentMenu from './menus/InstrumentMenu';
import EffectsMenu from './menus/EffectsMenu';
import SettingsMenu from './menus/SettingsMenu';
import SongsMenu from './menus/SongsMenu';
import { midiPlayer } from '../engine/MidiPlayer';

import type { VisualMode } from '../App';

interface ControlsProps {
    isPlayingDemo: boolean;
    setIsPlayingDemo: (playing: boolean) => void;
    // Settings
    showLabels: boolean;
    setShowLabels: (show: boolean) => void;
    showVelocity: boolean;
    setShowVelocity: (show: boolean) => void;
    // Visuals
    visualColor: string;
    setVisualColor: (color: string) => void;
    colorMode: 'single' | 'rainbow';
    setColorMode: (mode: 'single' | 'rainbow') => void;
    visualMode: VisualMode;
    setVisualMode: (mode: VisualMode) => void;
    visualEffect: 'none' | 'fire' | 'electric';
    setVisualEffect: (effect: 'none' | 'fire' | 'electric') => void;
    // Sustain Pedal
    sustainPedal: boolean;
    setSustainPedal: (active: boolean) => void;
    // Note Trail Settings
    noteTrailOpacity: number;
    setNoteTrailOpacity: (val: number) => void;
    noteTrailWidth: number;
    setNoteTrailWidth: (val: number) => void;
    noteTrailSpeed: number;
    setNoteTrailSpeed: (val: number) => void;
    noteTrailGradient: boolean;
    setNoteTrailGradient: (val: boolean) => void;
    noteTrailGlow: boolean;
    setNoteTrailGlow: (val: boolean) => void;
}

export default function Controls({
    isPlayingDemo, setIsPlayingDemo,
    showLabels, setShowLabels,
    showVelocity, setShowVelocity,
    visualColor, setVisualColor,
    colorMode, setColorMode,
    visualMode, setVisualMode,
    visualEffect, setVisualEffect,
    sustainPedal, setSustainPedal,
    noteTrailOpacity, setNoteTrailOpacity,
    noteTrailWidth, setNoteTrailWidth,
    noteTrailSpeed, setNoteTrailSpeed,
    noteTrailGradient, setNoteTrailGradient,
    noteTrailGlow, setNoteTrailGlow
}: ControlsProps) {
    const [volume, setVolume] = useState(0.8);
    const [currentInstrument, setCurrentInstrument] = useState<InstrumentType>('grand_piano');

    // Menus State
    const [showInstruments, setShowInstruments] = useState(false);
    const [showEffects, setShowEffects] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showSongs, setShowSongs] = useState(false);

    // Effects State
    const [reverbOn, setReverbOn] = useState(false);
    const [delayOn, setDelayOn] = useState(false);
    const [reverbWet, setReverbWet] = useState(0.2);
    const [delayWet, setDelayWet] = useState(0.1);

    // Playback Status
    const [currentTime, setCurrentTime] = useState(0);
    const [currentBPM, setCurrentBPM] = useState(120);
    const [songTitle, setSongTitle] = useState('');
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

    useEffect(() => {
        const updateStatus = () => {
            const song = midiPlayer.getCurrentSong();
            setCurrentTime(midiPlayer.getCurrentTime());
            setCurrentBPM(Math.round(midiPlayer.getCurrentBPM()));
            setSongTitle(song?.title || '');
            setPlaybackSpeed(midiPlayer.getPlaybackRate());
        };

        midiPlayer.addStatusListener(updateStatus);
        updateStatus();

        return () => {
            midiPlayer.removeStatusListener(updateStatus);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        Tone.Destination.volume.value = Tone.gainToDb(val);
    };

    const handleDemoToggle = () => {
        if (!isPlayingDemo) {
            setShowSongs(true);
        } else {
            // Stop playback
            import('../engine/MidiPlayer').then(({ midiPlayer }) => {
                midiPlayer.stop();
            });
            setIsPlayingDemo(false);
        }
    };

    return (
        <>
            {/* Top Toolbar - FL Studio Style */}
            <div className="toolbar-container">
                <div className="toolbar-section left">
                    <div className="app-logo">VPS</div>
                    <div className="separator" />
                    <button className={`toolbar-btn ${showInstruments ? 'active' : ''}`} onClick={() => setShowInstruments(true)}>
                        <Music size={18} />
                        <span>Instruments</span>
                    </button>
                    <button className={`toolbar-btn ${showEffects ? 'active' : ''}`} onClick={() => setShowEffects(true)}>
                        <Sliders size={18} />
                        <span>Effects</span>
                    </button>
                </div>

                <div className="toolbar-section center">
                    <div className="transport-box">
                        <button
                            className={`transport-play ${isPlayingDemo ? 'active' : ''}`}
                            onClick={handleDemoToggle}
                        >
                            {isPlayingDemo ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
                        </button>
                        <div className="status-display">
                            {songTitle && <span className="status-song">{songTitle}</span>}
                            <span className="status-time">{formatTime(currentTime)}</span>
                            <span className="status-bpm">{currentBPM} BPM</span>
                            {isPlayingDemo && <span className="status-speed">{playbackSpeed.toFixed(2)}x</span>}
                        </div>
                    </div>

                    {/* Playback Controls */}
                    {isPlayingDemo && (
                        <>
                            <div className="playback-controls-group">
                                <button
                                    className="toolbar-btn compact"
                                    onClick={() => midiPlayer.skip(-10)}
                                    title="Skip -10s"
                                >
                                    <SkipBack size={14} />
                                </button>
                                <button
                                    className="toolbar-btn compact"
                                    onClick={() => midiPlayer.skip(10)}
                                    title="Skip +10s"
                                >
                                    <SkipForward size={14} />
                                </button>
                            </div>

                            <div className="playback-controls-group">
                                <button
                                    className="toolbar-btn compact"
                                    onClick={() => midiPlayer.adjustSpeed(-0.1)}
                                    title="Slow Down"
                                >
                                    <Gauge size={14} />
                                </button>
                                <button
                                    className="toolbar-btn compact"
                                    onClick={() => midiPlayer.adjustSpeed(0.1)}
                                    title="Speed Up"
                                >
                                    <GaugeCircle size={14} />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Sustain Pedal Button */}
                    <button
                        className={`sustain-pedal ${sustainPedal ? 'active' : ''}`}
                        onClick={() => setSustainPedal(!sustainPedal)}
                        title="Sustain Pedal (Space)"
                    >
                        <div className="sustain-led"></div>
                        <Footprints size={14} className="sustain-icon" />
                        <span className="sustain-label">Sustain</span>
                    </button>
                </div>

                <div className="toolbar-section right">
                    <Volume2 size={16} color="#888" />
                    <input
                        type="range"
                        min="0" max="1" step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="toolbar-slider"
                    />
                    <button
                        className={`toolbar-btn icon-only ${showSettings ? 'active' : ''}`}
                        onClick={() => setShowSettings(true)}
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showInstruments && (
                <InstrumentMenu
                    currentInstrument={currentInstrument}
                    setInstrument={setCurrentInstrument}
                    onClose={() => setShowInstruments(false)}
                />
            )}

            {showEffects && (
                <EffectsMenu
                    reverbOn={reverbOn}
                    setReverbOn={setReverbOn}
                    delayOn={delayOn}
                    setDelayOn={setDelayOn}
                    reverbWet={reverbWet}
                    setReverbWet={setReverbWet}
                    delayWet={delayWet}
                    setDelayWet={setDelayWet}
                    onClose={() => setShowEffects(false)}
                />
            )}

            {showSettings && (
                <SettingsMenu
                    onClose={() => setShowSettings(false)}
                    showLabels={showLabels}
                    setShowLabels={setShowLabels}
                    showVelocity={showVelocity}
                    setShowVelocity={setShowVelocity}
                    visualColor={visualColor}
                    setVisualColor={setVisualColor}
                    colorMode={colorMode}
                    setColorMode={setColorMode}
                    visualMode={visualMode}
                    setVisualMode={setVisualMode}
                    visualEffect={visualEffect}
                    setVisualEffect={setVisualEffect}
                    // Note Trail Settings
                    noteTrailOpacity={noteTrailOpacity}
                    setNoteTrailOpacity={setNoteTrailOpacity}
                    noteTrailWidth={noteTrailWidth}
                    setNoteTrailWidth={setNoteTrailWidth}
                    noteTrailSpeed={noteTrailSpeed}
                    setNoteTrailSpeed={setNoteTrailSpeed}
                    noteTrailGradient={noteTrailGradient}
                    setNoteTrailGradient={setNoteTrailGradient}
                    noteTrailGlow={noteTrailGlow}
                    setNoteTrailGlow={setNoteTrailGlow}
                />
            )}

            {showSongs && (
                <SongsMenu
                    onClose={() => setShowSongs(false)}
                    setIsPlayingDemo={setIsPlayingDemo}
                />
            )}
        </>
    );
}
