
import { X, Play, Music2, StopCircle } from 'lucide-react';
import './InstrumentMenu.css'; // Reuse styles
import { midiPlayer } from '../../engine/MidiPlayer';
import { SONGS } from '../../config/songs';
import type { SongCategory } from '../../config/songs';
import { useState } from 'react';

interface SongsMenuProps {
    onClose: () => void;
    setIsPlayingDemo: (val: boolean) => void;
}

const CATEGORIES: SongCategory[] = ['Classical', 'Anime', 'Other'];

export default function SongsMenu({ onClose, setIsPlayingDemo }: SongsMenuProps) {
    const [currentSongId, setCurrentSongId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<SongCategory>('Classical');

    const handlePlay = (song: typeof SONGS[0]) => {
        setCurrentSongId(song.id);
        setIsPlayingDemo(true);
        midiPlayer.loadAndPlay(song.url, song);
    };

    const handleStop = () => {
        midiPlayer.stop();
        setCurrentSongId(null);
        setIsPlayingDemo(false);
    };

    const filteredSongs = SONGS.filter(s => s.category === activeTab);

    return (
        <div className="menu-overlay">
            <div className="menu-container songs-menu">
                <div className="menu-header">
                    <span>Library</span>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                {/* Tabs */}
                <div className="menu-tabs">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
                            onClick={() => setActiveTab(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="menu-content">
                    <div className="song-list">
                        {filteredSongs.map(song => (
                            <div key={song.id} className={`song-item ${currentSongId === song.id ? 'active' : ''}`}>
                                <div className="song-info">
                                    <Music2 size={16} />
                                    <span>{song.title}</span>
                                </div>
                                <button
                                    className="play-btn-small"
                                    onClick={() => currentSongId === song.id ? handleStop() : handlePlay(song)}
                                >
                                    {currentSongId === song.id ? <StopCircle size={14} color="#ff4444" /> : <Play size={14} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
