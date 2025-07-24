import React, { type FC, useEffect, useState } from 'react';
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

    return (
        <Box 
            sx={
                {
                    position: 'relative',
                    height: innerHeight,
                    width: innerWidth,
                    backgroundColor: '#111',
                }
            }
        >
            {index !== undefined && (
                <AudioVisualizer
                    index={index}
                    innerHeight={innerHeight}
                    innerWidth={innerWidth}
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
                    zIndex: 20,
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