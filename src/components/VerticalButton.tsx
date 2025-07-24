import React, { type FC, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const VerticalButton: FC<{
    clickHandler: (increment: boolean) => void;
    disabled: boolean;
    direction?: 'Previous' | 'Next';
}> = ({ 
    clickHandler, 
    direction,
    disabled, 
}) => {
    return (
        <Button
            onClick={() => clickHandler(false)}
            disabled={disabled}
            variant="contained"
            color="primary"
            sx={{
                margin: '10px',
                width: '5vw',
                minWidth: '40px',
                opacity: disabled ? 0.5 : 0.8,
                '&:hover': {
                    opacity: disabled ? 0.5 : 1
                }
            }}
        >
            {
                direction === 'Previous' && (
                    <Box 
                        component="span" 
                        sx={{ 
                            fontSize: '1.2rem' 
                        }}
                    >
                        &larr;
                    </Box>

                )
            }
            {
                direction === 'Next' && (
                    <Box 
                        component="span" 
                        sx={{ 
                            fontSize: '1.2rem' 
                        }}
                    >
                        &rarr;
                    </Box>

                )
            }
        </Button>

    )
}

export default VerticalButton;