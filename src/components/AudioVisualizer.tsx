import React, { type FC, useEffect, useRef, useState } from 'react';
import audioFiles from '../constants/waves';
import csvJSON from '../constants/normalized.json';
import SVGArtboard from './SVGArtboard';

const AudioVisualizer: FC<{ index: number }> = ({ index }) => {
    const amps = csvJSON[index];
    const audioFile = audioFiles[index];
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [counterText, setCounterText] = useState('');
    const requestRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const [currentDistance, setCurrentDistance] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const [pausedTime, setPausedTime] = useState(0);

    // Resize canvas to fit window
    useEffect(() => {
        const canvas = canvasRef.current;
        const resize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
        return () => window.removeEventListener('resize', resize);
    }, []);

    const handlePauseContinue = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (!isPaused) {
            // Pause
            audio.pause();
            setPausedTime(audio.currentTime);
            setIsPaused(true);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        } else {
            // Continue
            audio.currentTime = pausedTime;
            audio.play();
            setIsPaused(false);
            requestRef.current = requestAnimationFrame(draw);
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const audio = audioRef.current;
        if (!audio || !ctx) return
        const elapsed = audio.currentTime;
        const idx = Math.min(Math.floor(elapsed), amps.length - 1);
        const minAmp = Math.min(...amps);
        const maxAmp = Math.max(...amps);
        const ampNorm = (amps[idx] - minAmp) / (maxAmp - minAmp);
        const curve = 1.5;
        const maxAngle = Math.PI / 2;
        const angle = Math.pow(ampNorm, curve) * maxAngle;

        setCounterText(`${idx}: ${amps[idx].toFixed(5)} (${(angle * (180 / Math.PI)).toFixed(1)}º)`);

        const makeDistance = () => {
            const totalLengthCm = 122;
            const steps = 264;
            const stepSize = totalLengthCm / steps; // ≈ 0.4621 cm

            const distanceTraveled = idx * stepSize;
            return distanceTraveled.toFixed(1)
        }

        setCurrentDistance(makeDistance());

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-angle);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-canvas.width / 3, 0);
        ctx.lineTo(canvas.width / 3, 0);
        ctx.stroke();
        ctx.restore();

        if (!audio.paused && !audio.ended && idx < amps.length - 1) {
            requestRef.current = requestAnimationFrame(draw);
        } else {
            setIsPlaying(false);
        }
    };

    const handlePlay = () => {
        if(isPaused) setIsPaused(false);
        const audio = audioRef.current;
        if (!audio) return;
        console.log(audio);
        audio.currentTime = 0;
        audio.play();
        startTimeRef.current = performance.now();
        setIsPlaying(true);
        requestRef.current = requestAnimationFrame(draw);
    };

    return (
        <div style={{ margin: 0, overflow: 'hidden', backgroundColor: '#111', height: '100vh' }}>
            {
                <button
                    onClick={handlePlay}
                    style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}
                >
                    {!isPlaying ? 'Play' : 'restart'}
                </button>
            }
            {isPlaying && (
                <button
                    onClick={handlePauseContinue}
                    style={{ position: 'absolute', top: 70, left: 20, zIndex: 10 }}
                >
                    {isPaused ? 'Continue' : 'Pause'}
                </button>
            )}
            <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto', background: '#111' }} />
            <SVGArtboard coords={[amps[index -1] || 0, amps[index], amps[index + 1] || 0]} />
            <div
            style={{
                color: 'white',
                position: 'absolute',
                top: 20,
                left: 150,
                fontSize: '2em',
                zIndex: 10,
                fontFamily: 'monospace',
            }}>
                {index + 1} | {currentDistance}cm
            </div>
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    color: '#fff',
                    fontSize: '2em',
                    zIndex: 10,
                    fontFamily: 'monospace'
                }}
            >
                {counterText}
            </div>
            <audio ref={audioRef} src={audioFile} preload="auto" />
        </div>
    );
};

export default AudioVisualizer;