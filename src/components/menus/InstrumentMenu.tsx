
import { X } from 'lucide-react';
import './InstrumentMenu.css';
import { audioEngine } from '../../engine/AudioEngine';
import type { InstrumentType } from '../../engine/AudioEngine';

interface InstrumentMenuProps {
    currentInstrument: InstrumentType;
    setInstrument: (t: InstrumentType) => void;
    onClose: () => void;
}

const CATEGORIES = [
    {
        name: 'Pianos',
        instruments: [
            { id: 'grand_piano', label: 'Grand Concert' },
            { id: 'upright_piano', label: 'Piano Droit' }
        ]
    },
    {
        name: 'Claviers Classiques',
        instruments: [
            { id: 'harpsichord', label: 'Clavecin' },
            { id: 'organ', label: 'Orgue' }
        ]
    },
    {
        name: 'Synthétiseurs',
        instruments: [
            { id: 'synth', label: 'Synthé Analog' }
        ]
    },
];

export default function InstrumentMenu({ currentInstrument, setInstrument, onClose }: InstrumentMenuProps) {

    const handleSelect = (id: string) => {
        setInstrument(id as InstrumentType);
        audioEngine.setInstrument(id as InstrumentType);
    };

    return (
        <div className="menu-overlay">
            <div className="menu-container instrument-menu">
                <div className="menu-header">
                    <span>Select Instrument</span>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="menu-content">
                    {CATEGORIES.map(cat => (
                        <div key={cat.name} className="category-group">
                            <div className="category-header">
                                <span>{cat.name}</span>
                            </div>
                            <div className="instrument-list">
                                {cat.instruments.map(inst => (
                                    <button
                                        key={inst.id}
                                        className={`instrument-btn ${currentInstrument === inst.id ? 'active' : ''}`}
                                        onClick={() => handleSelect(inst.id)}
                                    >
                                        {inst.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
