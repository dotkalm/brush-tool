import React from "react";

const SVGArtboard: React.FC<{ 
  coords: number[];
  innerWidth: number;
  innerHeight: number;
}> = ({ 
  coords,
  innerHeight,
  innerWidth,
}) => (
    <svg
        height={innerHeight * .425}
        viewBox="0 0 940 182"
        width={innerWidth}
        xmlns="http://www.w3.org/2000/svg"
        className="artboard"
    >
        <path
            d={
                coords.map(e => {
                  return 250 - (e * 175);
                }).map((yCoord, idx) => {
                    const xCoord = idx * 100;
                    if (idx === 0) {
                        return `M 0,0 L ${xCoord},${yCoord}`
                    }
                    if (idx === coords.length - 1) {
                        return `L ${xCoord},${yCoord} L ${xCoord},0 Z`
                    }
                    return `L ${xCoord},${yCoord}`
                }).join(' ')
            }
            fill="darkgrey"
        />
    </svg>
);

export default SVGArtboard;