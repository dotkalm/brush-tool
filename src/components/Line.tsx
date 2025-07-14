import React, { type FC, useEffect, useState } from 'react';
import AudioVisualizer from './AudioVisualizer';
import csvJSON from '../constants/normalized.json';

const Line: FC = () => {
    const [index, setIndex] = useState<number>();

    // Load index from localStorage on mount
    useEffect(() => {
        const storedIndex = localStorage.getItem('lineIndex');
        if (storedIndex !== null) {
            setIndex(Number(storedIndex));
        }
    }, []);

    // Update localStorage whenever index changes
    useEffect(() => {
        index && localStorage.setItem('lineIndex', index.toString());
    }, [index]);

    function clickHandler(increment: boolean){
        if(index){
            setIndex(!increment ? (index - 1) : (index + 1))
        }
    }

    let previousDisabled = index === undefined;
    if(index && index <= 0){
        previousDisabled = true;
    }

    let nextDisabled = index === undefined;
    if(index && csvJSON.length - 1){
        nextDisabled = true;
    }
    return (
        <div>
            {index && <AudioVisualizer index={index}/>}
            <button onClick={() => clickHandler(false)} disabled={previousDisabled}>
                Previous
            </button>
            <button onClick={() => clickHandler(true)} disabled={nextDisabled}>
                Next
            </button>
        </div>
    );
};

export default Line;