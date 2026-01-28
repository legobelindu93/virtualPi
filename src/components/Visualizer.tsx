import { useEffect, useRef } from 'react';
import { audioEngine } from '../engine/AudioEngine';

export default function Visualizer() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const render = () => {
            // Logic: Get data from analyser
            if (audioEngine.analyser) {
                const values = audioEngine.analyser.getValue();
                // values is Float32Array of dBs or waveform depending on config.
                // We set it to 'fft' so it returns FFT data in dBs usually (-infinity to 0).

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw bars
                const barWidth = canvas.width / values.length;

                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#00f3ff';

                for (let i = 0; i < values.length; i++) {
                    const val = values[i] as number; // dB
                    // Map dB to height. -100dB -> 0, -10dB -> height
                    // Simple normalization
                    const normalized = (val + 100) / 100; // 0 to 1 roughly
                    const height = Math.max(0, normalized * canvas.height);

                    ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 1, height);

                    // Reflection effect (for glassmorphism feel)
                    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary') || '#bd00ff';
                    ctx.globalAlpha = 0.2;
                    ctx.fillRect(i * barWidth, canvas.height, barWidth - 1, height * 0.5);
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#00f3ff';
                }
            }
            animationId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={150}
            className="visualizer-canvas"
            style={{ width: '100%', height: '150px', borderRadius: '16px', marginBottom: '20px' }}
        />
    );
}
