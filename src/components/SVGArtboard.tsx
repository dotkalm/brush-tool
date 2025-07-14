import React from "react";

const SVGArtboard: React.FC<{ coords: number[] }> = ({ coords }) => {
    return (
    <svg
        height={200}
        viewBox="0 0 400 200"
        width={400}
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect
            fill="#fff"
            height={200}
            stroke="#ccc"
            width={400}
            x={0}
            y={0}
        />
    </svg>
    );
};

export default SVGArtboard;