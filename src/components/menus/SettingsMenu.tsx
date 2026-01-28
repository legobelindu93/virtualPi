
import { X, Check } from 'lucide-react';
import './SettingsMenu.css';

import type { VisualMode } from '../../App';

interface SettingsMenuProps {
    onClose: () => void;
    // Current GUI settings
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

export default function SettingsMenu({
    onClose,
    showLabels, setShowLabels,
    showVelocity, setShowVelocity,
    visualColor, setVisualColor,
    colorMode, setColorMode,
    visualMode, setVisualMode,
    visualEffect, setVisualEffect,
    noteTrailOpacity, setNoteTrailOpacity,
    noteTrailWidth, setNoteTrailWidth,
    noteTrailSpeed, setNoteTrailSpeed,
    noteTrailGradient, setNoteTrailGradient,
    noteTrailGlow, setNoteTrailGlow
}: SettingsMenuProps) {

    const COLORS = ['#00f3ff', '#00ff00', '#ff00ff', '#ff0000', '#ffff00', '#ffffff'];

    return (
        <div className="menu-overlay">
            <div className="menu-container settings-menu">
                <div className="menu-header">
                    <span>Settings</span>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="menu-content">
                    <div className="settings-section">
                        <h3>Interface</h3>

                        <div className="setting-row">
                            <span>Show Key Labels</span>
                            <button
                                className={`toggle-btn ${showLabels ? 'active' : ''}`}
                                onClick={() => setShowLabels(!showLabels)}
                            >
                                {showLabels ? <Check size={16} /> : null}
                            </button>
                        </div>

                        <div className="setting-row">
                            <span>Show Velocity</span>
                            <button
                                className={`toggle-btn ${showVelocity ? 'active' : ''}`}
                                onClick={() => setShowVelocity(!showVelocity)}
                            >
                                {showVelocity ? <Check size={16} /> : null}
                            </button>
                        </div>
                    </div>

                    <div className="settings-section" style={{ marginTop: '20px' }}>
                        <h3>Visual Effects</h3>

                        <div className="setting-column">
                            <span className="setting-label">Effect Mode</span>
                            <div className="mode-selector" style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                {(['classic', 'sheet_music_boss', 'particles', 'note_trail'] as VisualMode[]).map(mode => (
                                    <button
                                        key={mode}
                                        className={`mode-btn ${visualMode === mode ? 'active' : ''}`}
                                        onClick={() => setVisualMode(mode)}
                                        style={{
                                            flex: 1,
                                            background: visualMode === mode ? '#333' : '#111',
                                            border: visualMode === mode ? '1px solid var(--neon-blue)' : '1px solid #333',
                                            color: 'white', padding: '5px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {mode.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="setting-column" style={{ marginTop: '15px' }}>
                            <span className="setting-label">Visual Style</span>
                            <div className="mode-selector" style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                {(['none', 'fire', 'electric'] as ('none' | 'fire' | 'electric')[]).map(effect => (
                                    <button
                                        key={effect}
                                        className={`mode-btn ${visualEffect === effect ? 'active' : ''}`}
                                        onClick={() => setVisualEffect(effect)}
                                        style={{
                                            flex: 1,
                                            background: visualEffect === effect ? '#333' : '#111',
                                            border: visualEffect === effect ? '1px solid #ff8800' : '1px solid #333',
                                            color: 'white', padding: '5px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                                            textTransform: 'uppercase'
                                        }}
                                    >
                                        {effect === 'none' ? 'NORMAL' : effect}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {visualMode === 'note_trail' && (
                            <div className="sub-settings" style={{ borderLeft: '2px solid #444', paddingLeft: '10px', marginTop: '10px' }}>
                                <div className="setting-row">
                                    <span style={{ fontSize: '12px' }}>Opacity ({Math.round(noteTrailOpacity * 100)}%)</span>
                                    <input
                                        type="range" min="0.1" max="1" step="0.1"
                                        value={noteTrailOpacity}
                                        onChange={(e) => setNoteTrailOpacity(parseFloat(e.target.value))}
                                        style={{ width: '80px' }}
                                    />
                                </div>
                                <div className="setting-row">
                                    <span style={{ fontSize: '12px' }}>Width ({Math.round(noteTrailWidth * 100)}%)</span>
                                    <input
                                        type="range" min="0.1" max="1" step="0.1"
                                        value={noteTrailWidth}
                                        onChange={(e) => setNoteTrailWidth(parseFloat(e.target.value))}
                                        style={{ width: '80px' }}
                                    />
                                </div>
                                <div className="setting-row">
                                    <span style={{ fontSize: '12px' }}>Speed</span>
                                    <input
                                        type="range" min="1" max="20" step="1"
                                        value={noteTrailSpeed}
                                        onChange={(e) => setNoteTrailSpeed(parseInt(e.target.value))}
                                        style={{ width: '80px' }}
                                    />
                                </div>
                                <div className="setting-row">
                                    <span style={{ fontSize: '12px' }}>Gradient</span>
                                    <button
                                        className={`toggle-btn ${noteTrailGradient ? 'active' : ''} small`}
                                        onClick={() => setNoteTrailGradient(!noteTrailGradient)}
                                        style={{ width: '20px', height: '20px' }}
                                    >
                                        {noteTrailGradient ? <Check size={12} /> : null}
                                    </button>
                                </div>
                                <div className="setting-row">
                                    <span style={{ fontSize: '12px' }}>Glow</span>
                                    <button
                                        className={`toggle-btn ${noteTrailGlow ? 'active' : ''} small`}
                                        onClick={() => setNoteTrailGlow(!noteTrailGlow)}
                                        style={{ width: '20px', height: '20px' }}
                                    >
                                        {noteTrailGlow ? <Check size={12} /> : null}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="setting-column" style={{ marginTop: '15px' }}>
                            <span className="setting-label">Effect Color</span>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {/* Color Mode Toggle */}
                                <button
                                    onClick={() => setColorMode(colorMode === 'single' ? 'rainbow' : 'single')}
                                    style={{
                                        background: colorMode === 'rainbow' ? 'linear-gradient(45deg, red, yellow, green, blue, violet)' : '#333',
                                        border: '1px solid #555',
                                        color: colorMode === 'rainbow' ? 'black' : 'white',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    RAINBOW
                                </button>

                                <div className="color-selector" style={{ display: 'flex', gap: '8px', opacity: colorMode === 'rainbow' ? 0.3 : 1, pointerEvents: colorMode === 'rainbow' ? 'none' : 'auto' }}>
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setVisualColor(c)}
                                            style={{
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                backgroundColor: c,
                                                border: visualColor === c ? '2px solid white' : '1px solid #333',
                                                cursor: 'pointer',
                                                boxShadow: visualColor === c ? `0 0 10px ${c}` : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
