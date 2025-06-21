
import React from 'react';

interface RouletteWheelProps {
  items: string[];
  itemColors: string[];
  rotationDegrees: number;
  isSpinning: boolean;
}

const TEXT_COLOR = "#FFFFFF"; // White text for good contrast on colored segments
const STROKE_COLOR = "#FFFFFF"; // White stroke for segment separation
const STROKE_WIDTH = 2; // Stroke width for segment separation

// Helper function to calculate SVG path for a pie slice
const getPathD = (index: number, totalItems: number, radius: number): string => {
  if (totalItems === 0) return '';
  const anglePerItem = (2 * Math.PI) / totalItems;
  // Offset by -PI/2 to start drawing from the top (12 o'clock)
  const startAngle = index * anglePerItem - Math.PI / 2;
  const endAngle = (index + 1) * anglePerItem - Math.PI / 2;

  const cx = radius;
  const cy = radius;

  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);

  // For a single item, draw a full circle
  if (totalItems === 1) {
    // Path for a full circle: M cx,cy m -r,0 a r,r 0 1,0 (r*2),0 a r,r 0 1,0 -(r*2),0
    // Simpler: two half circles
     return `M ${cx - radius}, ${cy} A ${radius},${radius} 0 1 1 ${cx + radius},${cy} A ${radius},${radius} 0 1 1 ${cx - radius},${cy} Z`;
  }

  const largeArcFlag = anglePerItem > Math.PI ? 1 : 0;

  return `M ${cx},${cy} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
};


export const RouletteWheel: React.FC<RouletteWheelProps> = ({ items, itemColors, rotationDegrees, isSpinning }) => {
  const radius = 150; // SVG viewBox is 300x300, so radius is 150
  const viewBoxSize = radius * 2;
  const numItems = items.length;

  // Calculate text position and rotation
  const getTextProps = (index: number, totalItems: number) => {
    if (totalItems === 0) return { x: 0, y: 0, rotation: 0 };
    const anglePerItemRad = (2 * Math.PI) / totalItems;
    // Angle to the middle of the segment, offset by -PI/2 to align with SVG drawing from top
    const midAngleRad = index * anglePerItemRad + anglePerItemRad / 2 - Math.PI / 2;
    
    const textRadius = radius * 0.65; // Position text 65% out from the center
    const x = radius + textRadius * Math.cos(midAngleRad);
    const y = radius + textRadius * Math.sin(midAngleRad);
    
    // Convert radians to degrees for SVG transform
    let rotation = midAngleRad * (180 / Math.PI) + 90; // Add 90 because text elements are horizontal by default
    if (rotation > 90 && rotation < 270) { // Keep text upright
        rotation -= 180;
    }

    return { x, y, rotation };
  };


  return (
    <svg 
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
        className="w-full h-full drop-shadow-2xl"
        style={{ transformOrigin: 'center center' }} // Ensure rotation is around the center
    >
      <g 
        style={{ 
          transform: `rotate(${rotationDegrees}deg)`, 
          transformOrigin: 'center center',
          transition: isSpinning ? 'transform 6s cubic-bezier(0.15, 0.6, 0.3, 1)' : 'none', // Slower, smoother easing
        }}
      >
        {numItems > 0 ? items.map((item, index) => {
          const pathD = getPathD(index, numItems, radius);
          const color = itemColors[index % itemColors.length];
          const { x: textX, y: textY, rotation: textRotation } = getTextProps(index, numItems);
          
          // Truncate long item names
          const displayText = item.length > 15 ? item.substring(0, 12) + '...' : item;

          return (
            <g key={index}>
              <path d={pathD} fill={color} stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
              <text
                x={textX}
                y={textY}
                transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                fill={TEXT_COLOR}
                fontSize={numItems > 10 ? (numItems > 20 ? "8" : "10") : "12"} // Dynamic font size
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none"
              >
                {displayText}
              </text>
            </g>
          );
        }) : (
            <circle cx={radius} cy={radius} r={radius} fill="#E5E7EB" stroke={STROKE_COLOR} strokeWidth={STROKE_WIDTH} />
        )}
      </g>
      {/* Center Circle Decoration */}
      <circle cx={radius} cy={radius} r={radius * 0.15} fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="3" />
      <circle cx={radius} cy={radius} r={radius * 0.1} fill="#4F46E5" />
    </svg>
  );
};
