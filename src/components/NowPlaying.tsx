import { useEffect, useState } from 'react';
import { SkipBack, SkipForward, Gauge, GaugeCircle } from 'lucide-react';
import { midiPlayer } from '../engine/MidiPlayer';
import './NowPlaying.css';

export default function NowPlaying() {
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [bpm, setBpm] = useState(120);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [songTitle, setSongTitle] = useState('');

    useEffect(() => {
        const updateStatus = () => {
            const song = midiPlayer.getCurrentSong();
            setCurrentTime(midiPlayer.getCurrentTime());
            setTotalDuration(midiPlayer.getTotalDuration());
            setBpm(Math.round(midiPlayer.getCurrentBPM()));
            setPlaybackRate(midiPlayer.getPlaybackRate());
            setSongTitle(song?.title || '');
        };

        midiPlayer.addStatusListener(updateStatus);
        updateStatus();

        return () => {
            midiPlayer.removeStatusListener(updateStatus);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!songTitle) {
        return null;
    }

    return (
        <div className="now-playing-container">
            <div className="now-playing-info">
                <div className="song-title">{songTitle}</div>
                <div className="song-metadata">
                    <span className="metadata-item">
                        <span className="metadata-label">Time:</span>
                        <span className="metadata-value">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
                    </span>
                    <span className="metadata-separator">•</span>
                    <span className="metadata-item">
                        <span className="metadata-label">BPM:</span>
                        <span className="metadata-value">{bpm}</span>
                    </span>
                    <span className="metadata-separator">•</span>
                    <span className="metadata-item">
                        <span className="metadata-label">Speed:</span>
                        <span className="metadata-value">{playbackRate.toFixed(2)}x</span>
                    </span>
                </div>
            </div>

            <div className="playback-controls">
                <button
                    className="control-btn"
                    onClick={() => midiPlayer.skip(-10)}
                    title="Skip -10s"
                >
                    <SkipBack size={16} />
                    <span className="control-label">-10s</span>
                </button>

                <button
                    className="control-btn"
                    onClick={() => midiPlayer.skip(10)}
                    title="Skip +10s"
                >
                    <SkipForward size={16} />
                    <span className="control-label">+10s</span>
                </button>

                <div className="control-divider" />

                <button
                    className="control-btn"
                    onClick={() => midiPlayer.adjustSpeed(-0.1)}
                    title="Slow Down"
                >
                    <Gauge size={16} />
                    <span className="control-label">Speed -</span>
                </button>

                <button
                    className="control-btn"
                    onClick={() => midiPlayer.adjustSpeed(0.1)}
                    title="Speed Up"
                >
                    <GaugeCircle size={16} />
                    <span className="control-label">Speed +</span>
                </button>
            </div>
        </div>
    );
}
