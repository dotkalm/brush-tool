import React, { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';

interface TimelineScrubberProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  innerWidth: number;
  innerHeight: number;
}

const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  innerWidth,
  innerHeight,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updatePosition(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updatePosition(e);
    }
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };
  
  const updatePosition = (e: React.PointerEvent) => {
    const scrubber = scrubberRef.current;
    if (!scrubber || duration === 0) return;
    
    const rect = scrubber.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newTime = (percentage / 100) * duration;
    
    onSeek(newTime);
  };
  
  return (
    <Box
      sx={{
        width: innerWidth,
        zIndex: 15,
        padding: '10px 0',
      }}
    >
      <Box
        ref={scrubberRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        sx={{
          width: '100%',
          height: `${innerHeight * 0.04}px`, 
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          position: 'relative',
          cursor: 'pointer',
          touchAction: 'none',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }
        }}
      >
        {/* Progress bar */}
        <Box
          sx={{
            backgroundColor: 'orange',
            borderRadius: '20px',
            height: '100%',
            transition: isDragging ? 'none' : 'width 0.1s ease',
            width: `${progress}%`,
          }}
        />
        
        {/* Scrubber handle */}
        <Box
          sx={{
            backgroundColor: 'white',
            border: '2px solid orange',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            height: '20px',
            left: `${progress-1.5}%`,
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            transition: isDragging ? 'none' : 'left 0.1s ease',
            width: '20px',
          }}
        />
        
        {/* Time display */}
        <Box
          sx={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '4px',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '12px',
            left: `${progress-1.5}%`,
            padding: '2px 6px',
            position: 'absolute',
            top: '28px',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {Math.floor(currentTime)}s / {Math.floor(duration)}s
        </Box>
      </Box>
    </Box>
  );
};

export default TimelineScrubber;
