import React from "react";

const SVGArtboard: React.FC<{ coords: number[] }> = ({ coords }) => (
    <svg
        height={200}
        viewBox="0 0 600 200"
        width={600}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d={
                coords.map(e => 200 - (e * 65)).map((yCoord, idx) => {
                    const xCoord = idx * 100;
                    console.log({xCoord});
                    if (idx === 0) {
                        return `M 0,0 L ${xCoord},${yCoord}`
                    }
                    if (idx === coords.length - 1) {
                        return `L ${xCoord},${yCoord} L ${xCoord},0 Z`
                    }
                    return `L ${xCoord},${yCoord}`
                }).join(' ')
            }
            fill="orange"
        />
    </svg>
);

export default SVGArtboard;