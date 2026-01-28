import { useState, useEffect } from 'react';
import Piano from './components/Piano';
import Controls from './components/Controls';
import './App.css';

export type VisualMode = 'classic' | 'sheet_music_boss' | 'particles' | 'note_trail';

function App() {
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Settings State
  const [showLabels, setShowLabels] = useState(true);
  const [showVelocity, setShowVelocity] = useState(false);
  const [visualColor, setVisualColor] = useState('#00f3ff'); // Default Neon Cyan
  const [colorMode, setColorMode] = useState<'single' | 'rainbow'>('single');
  const [visualMode, setVisualMode] = useState<VisualMode>('classic');
  const [visualEffect, setVisualEffect] = useState<'none' | 'fire' | 'electric'>('none');
  const [sustainPedal, setSustainPedal] = useState(false);

  // Note Trail Settings
  const [noteTrailOpacity, setNoteTrailOpacity] = useState(0.8);
  const [noteTrailWidth, setNoteTrailWidth] = useState(0.9); // 0-1 relative to key width
  const [noteTrailSpeed, setNoteTrailSpeed] = useState(5); // px per frame
  const [noteTrailGradient, setNoteTrailGradient] = useState(true);
  const [noteTrailGlow, setNoteTrailGlow] = useState(true);

  // Space key toggles sustain pedal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only toggle if not typing in an input field
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSustainPedal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  return (
    <div className="app-container">
      {/* Top Toolbar */}
      <Controls
        isPlayingDemo={isPlayingDemo}
        setIsPlayingDemo={setIsPlayingDemo}
        // Settings Props
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        showVelocity={showVelocity}
        setShowVelocity={setShowVelocity}
        // Visuals
        visualColor={visualColor}
        setVisualColor={setVisualColor}
        colorMode={colorMode}
        setColorMode={setColorMode}
        visualMode={visualMode}
        setVisualMode={setVisualMode}
        visualEffect={visualEffect}
        setVisualEffect={setVisualEffect}
        sustainPedal={sustainPedal}
        setSustainPedal={setSustainPedal}
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

      {/* Main Piano World - fills remaining space */}
      <Piano
        isPlayingDemo={isPlayingDemo}
        showLabels={showLabels}
        visualColor={visualColor}
        colorMode={colorMode}
        visualMode={visualMode}
        visualEffect={visualEffect}
        sustainPedal={sustainPedal}
        // Visual Props
        noteTrailOpacity={noteTrailOpacity}
        noteTrailWidth={noteTrailWidth}
        noteTrailSpeed={noteTrailSpeed}
        noteTrailGradient={noteTrailGradient}
        noteTrailGlow={noteTrailGlow}
      />
    </div>
  );
}

export default App;
