
import { X } from 'lucide-react';
import './InstrumentMenu.css';
import { audioEngine } from '../../engine/AudioEngine';

interface EffectsMenuProps {
    reverbOn: boolean;
    setReverbOn: (value: boolean) => void;
    delayOn: boolean;
    setDelayOn: (value: boolean) => void;
    reverbWet: number;
    setReverbWet: (value: number) => void;
    delayWet: number;
    setDelayWet: (value: number) => void;
    onClose: () => void;
}

export default function EffectsMenu({
    reverbOn,
    setReverbOn,
    delayOn,
    setDelayOn,
    reverbWet,
    setReverbWet,
    delayWet,
    setDelayWet,
    onClose
}: EffectsMenuProps) {

    const toggleReverb = () => {
        const next = !reverbOn;
        setReverbOn(next);
        audioEngine.setReverbWet(next ? reverbWet : 0);
    };

    const toggleDelay = () => {
        const next = !delayOn;
        setDelayOn(next);
        audioEngine.setDelayWet(next ? delayWet : 0);
    };

    const handleReverbWetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setReverbWet(val);
        if (reverbOn) {
            audioEngine.setReverbWet(val);
        }
    };

    const handleDelayWetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setDelayWet(val);
        if (delayOn) {
            audioEngine.setDelayWet(val);
        }
    };

    return (
        <div className="menu-overlay">
            <div className="menu-container effects-menu">
                <div className="menu-header">
                    <span>Master Effects</span>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="menu-content">
                    <div className="effect-card">
                        <div className="toggle-header">
                            <span>Reverb (Hall)</span>
                            <div className={`toggle-switch ${reverbOn ? 'active' : ''}`} onClick={toggleReverb} />
                        </div>
                        <input
                            type="range"
                            className="modern-slider"
                            min="0"
                            max="1"
                            step="0.01"
                            value={reverbWet}
                            onChange={handleReverbWetChange}
                            disabled={!reverbOn}
                        />
                        <span className="effect-value">{Math.round(reverbWet * 100)}%</span>
                    </div>

                    <div className="effect-card">
                        <div className="toggle-header">
                            <span>Delay (Echo)</span>
                            <div className={`toggle-switch ${delayOn ? 'active' : ''}`} onClick={toggleDelay} />
                        </div>
                        <input
                            type="range"
                            className="modern-slider"
                            min="0"
                            max="1"
                            step="0.01"
                            value={delayWet}
                            onChange={handleDelayWetChange}
                            disabled={!delayOn}
                        />
                        <span className="effect-value">{Math.round(delayWet * 100)}%</span>
                    </div>

                    <div className="effect-card">
                        <div className="toggle-header">
                            <span>Stereo Widener</span>
                            <div className="toggle-switch" />
                        </div>
                        <span className="effect-note">Coming soon...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
