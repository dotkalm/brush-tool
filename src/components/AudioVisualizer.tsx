import React, { type FC, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Box from '@mui/material/Box';

import audioFiles from '../constants/waves';
import csvJSON from '../constants/normalized.json';
import SVGArtboard from './SVGArtboard';
import MeasurementDisplay from './Measurements';
import PlaybackButtons from './PlaybackButtons';
import BrushAngle from './BrushAngle';
import TimelineScrubber from './TimelineScrubber';

type AudioVisualizerProps = { 
    index: number;
    innerWidth: number;
    innerHeight: number;
    isScrubbing?: boolean;
};

const AudioVisualizer = forwardRef<any, AudioVisualizerProps>(({
    index,
    innerHeight,
    innerWidth,
    isScrubbing = false,
}, ref) => {
    const numberOfWindows = 11;

    const amps = csvJSON[index];
    const audioFile = audioFiles[index];

    const angleAnimationRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const requestRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const targetAngleRef = useRef(0);

    const [ampWindow, setAmpWindow] = useState<number[]>([]);
    const [counterText, setCounterText] = useState('');
    const [currentDistance, setCurrentDistance] = useState('');
    const [displayAngle, setDisplayAngle] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [measurements, setMeasurements] = useState<string[]>([]);
    const [pausedTime, setPausedTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [swipeAccumulator, setSwipeAccumulator] = useState(0);

    // Initialize measurements after component mounts
    useEffect(() => {
        setMeasurements(makeMeasurements());
    }, []);

    useEffect(() => {
        if (isPlaying && !isPaused) {
            if (!angleAnimationRef.current) {
                angleAnimationRef.current = requestAnimationFrame(animateAngle);
            }
        } else if (angleAnimationRef.current) {
            cancelAnimationFrame(angleAnimationRef.current);
            angleAnimationRef.current = null;
        }

        return () => {
            if (angleAnimationRef.current) {
                cancelAnimationFrame(angleAnimationRef.current);
                angleAnimationRef.current = null;
            }
        };
    }, [isPlaying, isPaused, displayAngle]);

    // Handle audio loaded to get duration
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const handleLoadedMetadata = () => {
            setAudioDuration(audio.duration);
        };
        
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        
        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [audioFile]);

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

    const handleSeek = (time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        
        audio.currentTime = time;
        
        if (isPaused) {
            setPausedTime(time);
        }
        
        // Update state immediately for responsive feedback
        const idx = Math.min(Math.floor(time), amps.length - 1);
        const minAmp = Math.min(...amps);
        const maxAmp = Math.max(...amps);
        const ampNorm = (amps[idx] - minAmp) / (maxAmp - minAmp);
        const curve = 1.5;
        const maxAngle = Math.PI / 2;
        const angle = Math.pow(ampNorm, curve) * maxAngle;
        
        targetAngleRef.current = angle;
        setCounterText(`${idx}`);
        setAmpWindow(getAmpWindow());
        setMeasurements(makeMeasurements());
    };

    const makeDistance = (index: number) => {
        const totalLengthCm = 122;
        const steps = 264;
        const stepSize = totalLengthCm / steps; // ≈ 0.4621 cm

        const distanceTraveled = index * stepSize;
        return distanceTraveled.toFixed(1)
    }

    const draw = () => {
        const audio = audioRef.current;
        if (!audio) return
        const elapsed = audio.currentTime;
        const idx = Math.min(Math.floor(elapsed), amps.length - 1);
        const minAmp = Math.min(...amps);
        const maxAmp = Math.max(...amps);
        const ampNorm = (amps[idx] - minAmp) / (maxAmp - minAmp);
        const curve = 1.5;
        const maxAngle = Math.PI / 2;
        const angle = Math.pow(ampNorm, curve) * maxAngle;

        // Update the target angle (the angle animation will smoothly transition to this value)
        targetAngleRef.current = angle;

        setCounterText(`${idx}`);
        setAmpWindow(getAmpWindow());
        setMeasurements(makeMeasurements());

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
        return makeWindowArray().map(i => {
            return makeDistance(i);
        });
    };

    function getAmpWindow(): number[] {
        return makeWindowArray()
            .map(i => amps[i] ?? 0);
    };

    function makeWindowArray(): number[] {
        const audio = audioRef.current;
        if (!audio || !amps || amps.length === 0) {
            return Array(numberOfWindows).fill(0);
        }
        const elapsed = audio.currentTime;
        const midPoint = Math.floor(numberOfWindows / 2);
        const distances = new Array(numberOfWindows).fill(0);
        const currentIndex = Math.min(Math.floor(elapsed), amps.length - 1);
        return distances.map((_, i) => {
            let subtractBy = 0;
            let addBy = 0;
            if (i < midPoint) {
                subtractBy = midPoint - i;
            }
            if (i > midPoint) {
                addBy = i - midPoint;
            }
            return currentIndex - subtractBy + addBy;
        });
    }

    function animateAngle(): void {
        if (!isPlaying) return;

        // Apply easing to transition between current display angle and target angle
        const easingFactor = 0.15; // Lower values make smoother but slower transitions
        const angleDiff = targetAngleRef.current - displayAngle;

        if (Math.abs(angleDiff) > 0.001) {
            setDisplayAngle(displayAngle + angleDiff * easingFactor);
        }

        angleAnimationRef.current = requestAnimationFrame(animateAngle);
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        handleSwipeScrub: (deltaX: number) => {
            const audio = audioRef.current;
            if (!audio || audioDuration === 0) return;
            
            // Accumulate swipe distance for smoother scrubbing
            const newAccumulator = swipeAccumulator + deltaX;
            setSwipeAccumulator(newAccumulator);
            
            // Convert swipe distance to time change (adjust sensitivity as needed)
            const sensitivity = 0.01; // Lower = more sensitive
            const timeChange = newAccumulator * sensitivity;
            
            // Calculate new time position
            const currentTime = audio.currentTime;
            const newTime = Math.max(0, Math.min(audioDuration, currentTime + timeChange));
            
            // Reset accumulator after applying change
            if (Math.abs(timeChange) > 0.1) {
                handleSeek(newTime);
                setSwipeAccumulator(0);
            }
        },
        togglePlayPause: () => {
            if (!isPlaying) {
                // Start playing from beginning or current position
                handlePlay();
            } else {
                // Toggle pause/continue
                handlePauseContinue();
            }
        }
    }));

    // Reset swipe accumulator when not scrubbing
    useEffect(() => {
        if (!isScrubbing) {
            setSwipeAccumulator(0);
        }
    }, [isScrubbing]);

    return (
        <Box
            sx={{
                backgroundColor: '#111',
                height: innerHeight, 
                width: innerWidth,
                margin: 0,
                overflow: 'hidden',
                touchAction: 'none', // Disable default touch actions
                '.axis': {
                    background: "#111",
                    display: "block",
                    margin: "0 auto",
                },
            }}
        >
            <PlaybackButtons 
                clickHandler={handlePlay}
                label={!isPlaying ? 'Play' : 'Restart'}
                top={20}
            />
            {isPlaying && (
                <PlaybackButtons 
                    clickHandler={handlePauseContinue}
                    label={isPaused ? 'Continue' : 'Pause'}
                    top={70}
                />
            )}
            <Box
                sx={{
                    alignItems:"center",
                    display:"flex",
                    flexDirection:"column",
                    width:"100%",
                    '.artboard':{
                        background:"tomato"
                    },
                    '.brush-angle-svg': {
                        background:"green"
                    },
                }}
            >
                <SVGArtboard 
                    coords={ampWindow}
                    innerHeight={innerHeight}
                    innerWidth={innerWidth}
                />
                <MeasurementDisplay measurements={measurements} />
                {/* Timeline Scrubber - show visual feedback when scrubbing */}
                <TimelineScrubber
                    currentTime={audioRef.current?.currentTime || 0}
                    duration={audioDuration}
                    isPlaying={isPlaying}
                    onSeek={handleSeek}
                    innerWidth={innerWidth}
                    innerHeight={innerHeight}
                    isScrubbing={isScrubbing}
                />
                <BrushAngle 
                    displayAngle={displayAngle} 
                    innerHeight={innerHeight}
                    innerWidth={innerWidth}
                />
            </Box>
            <Box
                sx={{
                    color: "white",
                    fontFamily: "monospace",
                    fontSize: "2em",
                    margin: "5px",
                    right: 0,
                    position: "absolute",
                    top: 0,
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "1vh",
                    '.counter':{
                        color: "purple",
                        backgroundColor: "lightyellow",
                        borderRadius: "45px",
                        minWidth: "60px",
                        height: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderColor: "purple",
                        borderStyle: "solid",
                        borderWidth: ".75vh",
                        fontWeight: "600",
                    }
                    
                }}
            >
                <Box className='counter'>
                    {index + 1}
                </Box>
                <Box className='counter'>
                    {counterText}
                </Box>
            </Box>
            <audio
                preload="auto"
                ref={audioRef}
                src={audioFile}
            />
        </Box>
    );
});

export default AudioVisualizer;