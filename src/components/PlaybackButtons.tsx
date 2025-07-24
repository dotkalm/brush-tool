import React from 'react';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';

interface PlaybackButtonsProps {
    label: string;
    clickHandler: () => void;
    top: number;
}

const PlaybackButtons: React.FC<PlaybackButtonsProps> = ({ 
    label, 
    clickHandler,
    top,
}) => (
    <Button
        variant="contained"
        onClick={clickHandler}
        sx={{
            left: 20,
            position: "absolute",
            top,
            zIndex: 10
        }}
    >
        {label}
    </Button>
);

export default PlaybackButtons;