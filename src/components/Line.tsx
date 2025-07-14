import React, { type FC, useEffect, useState } from 'react';
import AudioVisualizer from './AudioVisualizer';
import csvJSON from '../constants/normalized.json';

const Line: FC = () => {
    const [index, setIndex] = useState<number>();
    const [ previousDisabled, setPreviousDisabled ] = useState(true);
    const [ nextDisabled, setNextDisabled ] = useState(false);

    // Load index from localStorage on mount
    useEffect(() => {
        const storedIndex = localStorage.getItem('lineIndex');
        if (storedIndex !== null) {
            setIndex(Number(storedIndex));
        } else {
            localStorage.setItem('lineIndex', '0');
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
        <div>
            {index !== undefined && <AudioVisualizer index={index}/>}
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