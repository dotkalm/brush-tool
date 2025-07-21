import React from "react";

const SVGArtboard: React.FC<{ coords: number[] }> = ({ coords }) => (
    <svg
        height={200}
        viewBox="0 0 400 300"
        width={400}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d={
                coords.map(e => e * 100).map((yCoord, idx) => {
                    const xCoord = idx * 50;
                    if (idx === 0) {
                        return `M ${xCoord},${yCoord}`
                    }
                    if (idx === coords.length - 1) {
                        return `L ${xCoord},${yCoord} L 0, ${yCoord} Z`
                    }
                    return `L ${xCoord},${yCoord}`
                }).join('')
            }
            fill="#4a90e2"
            stroke-width="2"
            stroke="#2c5aa0"
        />
    </svg>
);

export default SVGArtboard;