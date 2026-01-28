import { useRef, useEffect } from 'react';
import { generateKeyboard, getNoteId } from '../utils/music';
import { PIANO_CONFIG } from '../config/piano';
import type { VisualMode } from '../App';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    type?: 'normal' | 'fire' | 'spark';
}

interface ActiveNoteVisual {
    noteId: string;
    startTime: number;
    keyX: number;
    keyWidth: number;
    color: string;
}

interface Trail {
    id: string; // unique id
    noteId: string;
    keyX: number;
    keyWidth: number;
    startTime: number;
    endTime: number | null; // null if still held
    color: string;
}

const NOTE_COLORS = [
    '#00f3ff', // C - Cyan
    '#00ff9d', // C# - Greenish Cyan
    '#00ff00', // D - Green
    '#ccff00', // D# - Lime
    '#ffff00', // E - Yellow
    '#ffcc00', // F - Gold
    '#ff8800', // F# - Orange
    '#ff0000', // G - Red
    '#ff0088', // G# - Pink
    '#ff00ff', // A - Magenta
    '#8800ff', // A# - Purple
    '#0000ff'  // B - Blue
];

export default function SynthesiaCanvas({
    activeNotes, visualMode, particlesEnabled, visualColor,
    colorMode = 'single', visualEffect = 'none',
    noteTrailOpacity = 0.8,
    noteTrailWidth = 0.9,
    noteTrailSpeed = 5,
    noteTrailGradient = true,
    noteTrailGlow = true
}: {
    activeNotes: Set<string>,
    visualMode: VisualMode,
    particlesEnabled: boolean,
    visualColor: string,
    colorMode?: 'single' | 'rainbow',
    visualEffect?: 'none' | 'fire' | 'electric',
    noteTrailOpacity?: number,
    noteTrailWidth?: number,
    noteTrailSpeed?: number,
    noteTrailGradient?: boolean,
    noteTrailGlow?: boolean
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const activeVisuals = useRef<Map<string, ActiveNoteVisual>>(new Map());

    // Note Trail Logic
    const trails = useRef<Trail[]>([]);
    const nextTrailId = useRef(0);

    // Keeping activeNotes in a ref to avoid effect cleanup
    const activeNotesRef = useRef(activeNotes);
    const particlesEnabledRef = useRef(particlesEnabled);
    const effectRef = useRef(visualEffect);

    useEffect(() => {
        activeNotesRef.current = activeNotes;
    }, [activeNotes]);

    useEffect(() => {
        particlesEnabledRef.current = particlesEnabled;
    }, [particlesEnabled]);

    useEffect(() => {
        effectRef.current = visualEffect;
    }, [visualEffect]);

    // Pre-calculate key positions
    const keys = generateKeyboard(PIANO_CONFIG.startOctave, PIANO_CONFIG.endOctave);
    const whiteKeys = keys.filter(k => !k.isSharp);
    const keyPositions = useRef<Map<string, { x: number, width: number }>>(new Map());

    // Init Key Positions - MUST MATCH Piano.tsx logic
    useEffect(() => {
        const map = new Map();
        whiteKeys.forEach((k, index) => {
            const id = getNoteId(k.note, k.octave);
            const x = index * PIANO_CONFIG.whiteKeyWidth;
            map.set(id, { x, width: PIANO_CONFIG.whiteKeyWidth });
        });
        keys.filter(k => k.isSharp).forEach(k => {
            const id = getNoteId(k.note, k.octave);
            const baseNote = k.note.replace('#', '');
            const refIndex = whiteKeys.findIndex(wk => wk.note === baseNote && wk.octave === k.octave);
            if (refIndex !== -1) {
                const x = (refIndex + 1) * PIANO_CONFIG.whiteKeyWidth - (PIANO_CONFIG.blackKeyWidth / 2);
                map.set(id, { x, width: PIANO_CONFIG.blackKeyWidth });
            }
        });
        keyPositions.current = map;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                const width = Math.max(parent.scrollWidth, parent.clientWidth);
                canvas.width = width;
                canvas.height = parent.clientHeight;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        let animationFrame: number;

        const render = () => {
            const effect = effectRef.current; // access ref in loop

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bottomY = canvas.height;
            const now = performance.now();
            const currentNotes = activeNotesRef.current;

            // Helper to get color
            const getColor = (noteId: string) => {
                if (colorMode === 'rainbow') {
                    const noteName = noteId.slice(0, -1);
                    const noteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(noteName);
                    return noteIndex >= 0 ? NOTE_COLORS[noteIndex] : visualColor;
                }
                return visualColor;
            };

            // -----------------------------------------------------
            // 1. Manage Active Visuals (Generic)
            // -----------------------------------------------------
            currentNotes.forEach(noteId => {
                if (!activeVisuals.current.has(noteId)) {
                    const pos = keyPositions.current.get(noteId);
                    if (pos) {
                        const color = getColor(noteId);
                        activeVisuals.current.set(noteId, {
                            noteId,
                            startTime: now,
                            keyX: pos.x,
                            keyWidth: pos.width,
                            color
                        });

                        // Spawn Particles on Attack
                        if (particlesEnabledRef.current && visualMode !== 'note_trail') {
                            const pCount = visualMode === 'sheet_music_boss' ? 30 : 15;
                            for (let i = 0; i < pCount; i++) {
                                let pColor = color;
                                let vy = -(Math.random() * 8 + 2);
                                let vx = (Math.random() - 0.5) * 4;
                                let life = 1.0;
                                let type: 'normal' | 'fire' | 'spark' = 'normal';

                                if (effect === 'fire') {
                                    pColor = Math.random() > 0.5 ? '#ff4400' : '#ffcc00';
                                    vy = -(Math.random() * 10 + 5); // Fast up
                                    type = 'fire';
                                } else if (effect === 'electric') {
                                    pColor = '#ffffff';
                                    vx = (Math.random() - 0.5) * 15; // Crazy horizontal
                                    vy = (Math.random() - 0.5) * 15; // Crazy vertical
                                    type = 'spark';
                                }

                                particles.current.push({
                                    x: pos.x + Math.random() * pos.width,
                                    y: bottomY,
                                    vx, vy, life, color: pColor, type
                                });
                            }
                        }
                    }
                }
            });

            // Cleanup Active Visuals
            activeVisuals.current.forEach((_, k) => {
                if (!currentNotes.has(k)) {
                    activeVisuals.current.delete(k);
                }
            });

            // -----------------------------------------------------
            // 2. Note Trail Logic
            // -----------------------------------------------------
            if (visualMode === 'note_trail') {
                // A. Create new trails
                currentNotes.forEach(noteId => {
                    const activeTrail = trails.current.find(t => t.noteId === noteId && t.endTime === null);
                    if (!activeTrail) {
                        const pos = keyPositions.current.get(noteId);
                        if (pos) {
                            const color = getColor(noteId);
                            trails.current.push({
                                id: `trail_${nextTrailId.current++}`,
                                noteId,
                                keyX: pos.x,
                                keyWidth: pos.width,
                                startTime: now,
                                endTime: null,
                                color
                            });
                        }
                    }
                });

                // B. Close trails
                trails.current.forEach(trail => {
                    if (trail.endTime === null && !currentNotes.has(trail.noteId)) {
                        trail.endTime = now;
                    }
                });

                // C. Render Trails
                const speedFactor = noteTrailSpeed * 0.06;

                ctx.globalAlpha = noteTrailOpacity;

                for (let i = trails.current.length - 1; i >= 0; i--) {
                    const t = trails.current[i];
                    const timeSinceStart = now - t.startTime;
                    const topY = bottomY - (timeSinceStart * speedFactor);
                    let rectBottomY = bottomY;
                    if (t.endTime !== null) {
                        const timeSinceEnd = now - t.endTime;
                        rectBottomY = bottomY - (timeSinceEnd * speedFactor);
                    }

                    if (rectBottomY < -100) {
                        trails.current.splice(i, 1);
                        continue;
                    }

                    const height = rectBottomY - topY;
                    if (height <= 0) continue;

                    const w = t.keyWidth * noteTrailWidth;
                    let x = t.keyX + (t.keyWidth - w) / 2;
                    let radius = Math.min(w / 2, 10);

                    // EFFECT MODIFIERS
                    if (effect === 'fire') {
                        // Fire Wiggle
                        x += (Math.random() - 0.5) * 4;
                    } else if (effect === 'electric') {
                        x += (Math.random() - 0.5) * 2;
                    }

                    ctx.save();

                    // Glow
                    if (noteTrailGlow || effect === 'fire' || effect === 'electric') {
                        ctx.shadowBlur = (effect === 'electric') ? 20 : 15;
                        ctx.shadowColor = (effect === 'fire') ? '#ff4400' : (effect === 'electric' ? '#00ffff' : t.color);
                    } else {
                        ctx.shadowBlur = 0;
                    }

                    // Gradient / Fill
                    if (effect === 'fire') {
                        const fireGrad = ctx.createLinearGradient(0, rectBottomY, 0, topY);
                        fireGrad.addColorStop(0, '#ffff00'); // Base hot yellow
                        fireGrad.addColorStop(0.5, '#ff4400'); // Mid red
                        fireGrad.addColorStop(1, 'rgba(50, 0, 0, 0)'); // Smoke top
                        ctx.fillStyle = fireGrad;
                    } else if (noteTrailGradient) {
                        const grad = ctx.createLinearGradient(0, rectBottomY, 0, topY);
                        grad.addColorStop(0, t.color);
                        grad.addColorStop(1, 'transparent');
                        ctx.fillStyle = grad;
                    } else {
                        ctx.fillStyle = t.color;
                    }

                    // Shape Drawing
                    if (effect === 'electric') {
                        // Electric Bolt Style
                        ctx.strokeStyle = t.color;
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(x + w / 2, rectBottomY);
                        let cy = rectBottomY;
                        while (cy > topY) {
                            cy -= Math.random() * 20 + 10;
                            const cx = x + w / 2 + (Math.random() - 0.5) * 30;
                            ctx.lineTo(cx, cy);
                        }
                        ctx.stroke();
                        // Also draw core for visibility?
                        ctx.globalAlpha = 0.5;
                        ctx.fillRect(x + w * 0.4, topY, w * 0.2, height);
                        ctx.globalAlpha = noteTrailOpacity;

                    } else {
                        // Standard Rounded Rect
                        const r = Math.max(0, radius);
                        ctx.beginPath();
                        ctx.moveTo(x + r, topY);
                        ctx.lineTo(x + w - r, topY);
                        ctx.quadraticCurveTo(x + w, topY, x + w, topY + r);
                        ctx.lineTo(x + w, rectBottomY - r);
                        ctx.quadraticCurveTo(x + w, rectBottomY, x + w - r, rectBottomY);
                        ctx.lineTo(x + r, rectBottomY);
                        ctx.quadraticCurveTo(x, rectBottomY, x, rectBottomY - r);
                        ctx.lineTo(x, topY + r);
                        ctx.quadraticCurveTo(x, topY, x + r, topY);
                        ctx.closePath();
                        ctx.fill();
                    }

                    ctx.restore();

                    // Continuous Effect Particles
                    if (t.endTime === null && Math.random() < 0.3) {
                        // While holding note, spawn continuous effect particles
                        if (effect === 'fire') {
                            particles.current.push({
                                x: x + Math.random() * w,
                                y: bottomY - Math.random() * 50,
                                vx: (Math.random() - 0.5) * 2,
                                vy: -Math.random() * 5 - 2,
                                life: 1.0,
                                color: '#ffaa00',
                                type: 'fire'
                            });
                        } else if (effect === 'electric') {
                            if (Math.random() < 0.1) {
                                particles.current.push({
                                    x: x + w / 2,
                                    y: bottomY - Math.random() * 100,
                                    vx: (Math.random() - 0.5) * 10,
                                    vy: (Math.random() - 0.5) * 10,
                                    life: 0.5,
                                    color: '#fff',
                                    type: 'spark'
                                });
                            }
                        }
                    }
                }
                ctx.globalAlpha = 1.0;
            }

            // -----------------------------------------------------
            // 3. Other Visual Modes
            // -----------------------------------------------------
            else {
                currentNotes.forEach(noteId => {
                    const viz = activeVisuals.current.get(noteId);
                    if (viz) {
                        const x = viz.keyX;
                        const w = viz.keyWidth;
                        const yVal = bottomY;

                        // Apply Color Override for Effects
                        let drawColor = viz.color;
                        if (effect === 'fire') drawColor = '#ff4400';
                        if (effect === 'electric') drawColor = '#ccffff';

                        // Classic / Particles logic
                        if (visualMode === 'classic') {
                            // Effect Logic for Classic
                            // ... existing logic but with effect mods ...
                            // For brevity, just standard drawing with new color
                            const barWidth = w * 0.8;
                            const barX = x + (w - barWidth) / 2;
                            const gradient = ctx.createLinearGradient(0, yVal, 0, 0);
                            gradient.addColorStop(0, drawColor);
                            gradient.addColorStop(0.8, 'transparent');
                            ctx.globalCompositeOperation = 'screen';
                            ctx.fillStyle = gradient;
                            ctx.fillRect(barX, 0, barWidth, yVal);

                            const coreWidth = barWidth * 0.4;
                            const coreX = x + (w - coreWidth) / 2;
                            const coreGradient = ctx.createLinearGradient(0, yVal, 0, yVal - 200);
                            coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                            coreGradient.addColorStop(1, 'transparent');
                            ctx.fillStyle = coreGradient;
                            ctx.fillRect(coreX, 0, coreWidth, yVal);
                            ctx.globalCompositeOperation = 'source-over';
                        } else if (visualMode === 'particles' || visualMode === 'sheet_music_boss') {
                            // Just base glow
                            ctx.shadowBlur = 15;
                            ctx.shadowColor = drawColor;
                            ctx.fillStyle = drawColor;
                            ctx.fillRect(x, yVal - 5, w, 5);
                            ctx.shadowBlur = 0;
                        }
                    }
                });
            }

            // Visualize Particles
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;

                if (p.type === 'fire') {
                    p.vy += -0.1; // Float up
                    p.x += (Math.random() - 0.5) * 2; // Wiggle
                } else if (p.type === 'spark') {
                    // chaotic
                } else {
                    p.vy += 0.1; // Gravity
                }

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.random() * 4 + 1, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            animationFrame = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrame);
        };
    }, [visualMode, visualColor, colorMode, visualEffect, noteTrailOpacity, noteTrailWidth, noteTrailSpeed, noteTrailGradient, noteTrailGlow]);

    return (
        <canvas
            ref={canvasRef}
            className="synthesia-canvas"
            style={{ width: '100%', height: '100%', display: 'block' }}
        />
    );
}
