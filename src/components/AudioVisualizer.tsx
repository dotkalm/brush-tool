import React, { type FC, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

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
    const [ampWindow, setAmpWindow] = useState<number[]>([]);
    const [measurements, setMeasurements] = useState<string[]>([])

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

    const makeDistance = (index: number) => {
        const totalLengthCm = 122;
        const steps = 264;
        const stepSize = totalLengthCm / steps; // ≈ 0.4621 cm

        const distanceTraveled = index * stepSize;
        return distanceTraveled.toFixed(1)
    }

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
        setCurrentDistance(makeDistance(idx));
        setAmpWindow(getAmpWindow());
        setMeasurements(makeMeasurements());

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
        audio.currentTime = 0;
        audio.play();
        startTimeRef.current = performance.now();
        setIsPlaying(true);
        requestRef.current = requestAnimationFrame(draw);
    };

    function makeMeasurements(): string[] {
        const audio = audioRef.current;
        if (!audio) return Array(7).fill(0);
        const elapsed = audio.currentTime;
        const currentIndex = Math.min(Math.floor(elapsed), amps.length - 1);
        return [
            makeDistance(currentIndex - 3),
            makeDistance(currentIndex - 2),
            makeDistance(currentIndex - 1),
            makeDistance(currentIndex),
            makeDistance(currentIndex + 1),
            makeDistance(currentIndex + 2),
            makeDistance(currentIndex + 3),
        ];
    };

    function getAmpWindow(): number[] {
        const audio = audioRef.current;
        if (!audio) return Array(7).fill(0);
        const elapsed = audio.currentTime;
        const currentIndex = Math.min(Math.floor(elapsed), amps.length - 1);
        return [
            amps[currentIndex - 3] ?? 0,
            amps[currentIndex - 2] ?? 0,
            amps[currentIndex - 1] ?? 0,
            amps[currentIndex] ?? 0,
            amps[currentIndex + 1] ?? 0,
            amps[currentIndex + 2] ?? 0,
            amps[currentIndex + 3] ?? 0,
        ];
    };

    return (
        <Box
            sx={{
                backgroundColor: '#111',
                height: '100vh',
                margin: 0,
                overflow: 'hidden',
                '.axis': {
                    background: "#111",
                    display: "block",
                    margin: "0 auto",
                },
            }}
        >
            {
                <Button
                    onClick={handlePlay}
                    sx={{
                        left: 20,
                        position: "absolute",
                        top: 20,
                        zIndex: 10
                    }}
                    variant="outlined"
                >
                    {!isPlaying ? 'Play' : 'restart'}
                </Button>
            }
            {isPlaying && (
                <Button
                    onClick={handlePauseContinue}
                    sx={{
                        left: 20,
                        position: "absolute",
                        top: 70,
                        zIndex: 10
                    }}
                    variant="outlined"
                >
                    {isPaused ? 'Continue' : 'Pause'}
                </Button>
            )}
            <Box
                sx={{
                    alignItems:"center",
                    display:"flex",
                    flexDirection:"column",
                    width:"100%",
                    svg:{
                        background:"green"
                    }
                }}
            >
                <SVGArtboard coords={ampWindow}/>
                <Box
                    sx={{
                        display:"flex",
                        flexDirection:"row",
                        justifyContent:"space-evenly",
                        justifyItems:"stretch",
                        width:"600px",
                    }}
                >
                    {measurements.map((e, index) => (
                        <Box color="white" key={`${e}_${index}`}>
                            {e}cm
                        </Box>
                    ))}
                </Box>
            </Box>
            <canvas className="axis" ref={canvasRef}/>
            <Box
                sx={{
                    color: "white",
                    fontFamily: "monospace",
                    fontSize: "2em",
                    left: 150,
                    position: "absolute",
                    top: 20,
                    zIndex: 10,
                }}
            >
                {index + 1} | {currentDistance}cm
            </Box>
            <Box
                sx={{
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: "2em",
                    position: "absolute",
                    right: 20,
                    top: 20,
                    zIndex: 10,
                }}
            >
                {counterText}
            </Box>
            <audio
                preload="auto"
                ref={audioRef}
                src={audioFile}
            />
        </Box>
    );
};

export default AudioVisualizer;