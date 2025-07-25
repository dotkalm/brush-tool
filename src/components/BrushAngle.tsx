import React from 'react';
type BrushAngleProps = {
    displayAngle: number;
    innerWidth: number;
    innerHeight: number;
};

const BrushAngle: React.FC<BrushAngleProps> = ({
    displayAngle,
    innerWidth: _,
    innerHeight,
}) => (
    <svg
        width="100%"
        height={innerHeight * 0.45}
        viewBox="0 0 600 100"
        preserveAspectRatio="xMidYMid meet"
        className="brush-angle-svg"
    >
        <g transform="translate(300, 50)">
            <line
                x1="-200"
                y1="0"
                x2="200"
                y2="0"
                stroke="#333"
                strokeWidth="1"
            />
            <line
                x1="0"
                y1="-80"
                x2="0"
                y2="80"
                stroke="#333"
                strokeWidth="1"
            />
            <g transform={`rotate(${-(displayAngle * 180 / Math.PI)})`}>
                <line
                    x1="-200"
                    y1="0"
                    x2="200"
                    y2="0"
                    stroke="lightyellow"
                    strokeWidth={6}
                />
            </g>
        </g>
    </svg>
);

export default BrushAngle;