import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

const Measurements: React.FC<{ measurements: string[] }> = ({ measurements }) => {
    return (
        <Box
            sx={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                justifyItems: "stretch",
                width: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(11, 1fr)",
                position: "relative",
                "& > div": {
                    // Apply to all child divs
                    textAlign: "center",
                    position: "relative",
                    minWidth: 0, // Allow cells to shrink if needed
                }
            }}
        >
            {measurements.map((e, index) => {
                const isMiddle = index === Math.floor(measurements.length / 2);
                return (
                    <Box
                        color={isMiddle ? "white" : "pink"}
                        key={`${e}_${index}`}
                        sx={{
                            backgroundColor: "brown",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "8vh",
                            alignContent: "center",
                        }}
                    >
                        <Box>
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={{
                                    height: "65vh",
                                    position: "absolute",
                                    transform: "translateY(-65vh)",
                                    width: isMiddle ? "2px" : "1px",
                                    backgroundColor: isMiddle ? "#222222" : "#636363",
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                fontSize: "1em",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingTop: "2vh",
                                fontWeight: isMiddle ? "600" : "400",
                                textDecoration: isMiddle ? "underline" : "none",
                            }}
                        >{e}cm</Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default Measurements;