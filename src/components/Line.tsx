import React, { type FC, useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import AudioVisualizer from './AudioVisualizer';
import VerticalButton from './VerticalButton';
import csvJSON from '../constants/normalized.json';

const Line: FC = () => {
    const [index, setIndex] = useState<number>();
    const [previousDisabled, setPreviousDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(false);
    const [windowDimensions, setWindowDimensions] = useState({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
    });

    // Touch handling refs and state
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
    const audioVisualizerRef = useRef<any>(null);
    const [isScrubbing, setIsScrubbing] = useState(false);

    const { innerWidth, innerHeight } = windowDimensions;

    useEffect(() => {
        // Resize window dimensions to fit window
        const resize = () => {
            setWindowDimensions({
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
            });
        };
        window.addEventListener('resize', resize);
        resize();
        return () => window.removeEventListener('resize', resize);
    }, []);

    // Load index from localStorage on mount
    useEffect(() => {
        const storedIndex = localStorage.getItem('lineIndex');
        if (storedIndex !== null) {
            setIndex(Number(storedIndex));
            if (Number(storedIndex) < 0) {
                localStorage.setItem('lineIndex', '0');
                setIndex(0);
            }
        } else {
            localStorage.setItem('lineIndex', '0');
            setIndex(0);
        }
    }, []);

    // Update localStorage whenever index changes
    useEffect(() => {
        index && localStorage.setItem('lineIndex', index.toString());
    }, [index]);

    function clickHandler(increment: boolean){
        if(index !== undefined){
            setIndex(!increment ? (index - 1) : (index + 1))
        }
    }

    useEffect(() => {
        if(index !== undefined && csvJSON.length - 1 >= index){
            setNextDisabled(false);
        }else{
            setNextDisabled(true)
        }
        if(index !== undefined && index >= 0){
            setPreviousDisabled(false);
        }else{
            setPreviousDisabled(true);
        }
    }, [nextDisabled, previousDisabled, index]);

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
        // Check if touch is on a button element
        const target = e.target as Element;
        if (target.closest('button') || target.closest('[role="button"]')) {
            return; // Don't prevent default for buttons
        }
        
        e.preventDefault(); // Prevent default touch behavior
        
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStartRef.current = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            };
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        // Check if touch is on a button element
        const target = e.target as Element;
        if (target.closest('button') || target.closest('[role="button"]')) {
            return; // Don't prevent default for buttons
        }
        
        e.preventDefault(); // Prevent default touch behavior
        
        if (e.touches.length === 1 && touchStartRef.current) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;
            
            // Check if this is primarily a horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                setIsScrubbing(true);
                
                // Call the scrubber function from AudioVisualizer
                if (audioVisualizerRef.current && audioVisualizerRef.current.handleSwipeScrub) {
                    audioVisualizerRef.current.handleSwipeScrub(deltaX);
                }
            }
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        // Check if touch is on a button element
        const target = e.target as Element;
        if (target.closest('button') || target.closest('[role="button"]')) {
            return; // Don't prevent default for buttons
        }
        
        e.preventDefault(); // Prevent default touch behavior
        
        if (touchStartRef.current) {
            const touchDuration = Date.now() - touchStartRef.current.time;
            const touch = e.changedTouches[0];
            const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
            const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
            const totalMovement = deltaX + deltaY;
            
            // Detect tap: short duration, minimal movement
            const isTap = touchDuration < 300 && totalMovement < 20;
            
            if (isTap && !isScrubbing) {
                // Toggle play/pause via AudioVisualizer
                if (audioVisualizerRef.current && audioVisualizerRef.current.togglePlayPause) {
                    audioVisualizerRef.current.togglePlayPause();
                }
            }
        }
        
        touchStartRef.current = null;
        setIsScrubbing(false);
    };

    // Add touch event listeners
    useEffect(() => {
        const element = document.body;
        
        // Add touch event listeners with passive: false to allow preventDefault
        element.addEventListener('touchstart', handleTouchStart, { passive: false });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return (
        <Box 
            sx={{
                position: 'relative',
                height: innerHeight,
                width: innerWidth,
                backgroundColor: '#111',
                touchAction: 'none', // Disable default touch actions
            }}
        >
            {index !== undefined && (
                <AudioVisualizer
                    ref={audioVisualizerRef}
                    index={index}
                    innerHeight={innerHeight}
                    innerWidth={innerWidth}
                    isScrubbing={isScrubbing}
                />
            )}
            {/* Navigation buttons positioned at the sides of the screen */}
            <Box
                sx={{
                    bottom: '0px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    left: '0',
                    position: 'absolute',
                    right: '0',
                    width: '100%',
                    zIndex: 30, // Increased z-index to ensure buttons are on top
                    touchAction: 'auto', // Allow normal touch behavior for buttons
                }}
            >
                <VerticalButton
                    clickHandler={clickHandler}
                    direction="Previous"
                    disabled={previousDisabled}
                />
                <VerticalButton
                    clickHandler={clickHandler}
                    direction="Next"
                    disabled={nextDisabled}
                />
            </Box>
        </Box>
    );
};

export default Line;