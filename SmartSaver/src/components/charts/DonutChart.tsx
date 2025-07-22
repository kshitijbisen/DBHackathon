import React, { useState } from 'react';

interface DonutData {
  category: string;
  amount: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutData[];
  size?: number;
  onSegmentClick?: (category: string) => void;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  size = 200, 
  onSegmentClick 
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-full" style={{ width: size, height: size }}>
        <p className="text-gray-500 text-sm">No data</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const colors = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5A2B', '#6B46C1', '#059669', '#DC2626', '#7C2D12'
  ];

  const center = size / 2;
  const radius = size * 0.35;
  const innerRadius = size * 0.2;

  let cumulativePercentage = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.amount / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360 - 90;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360 - 90;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const x3 = center + innerRadius * Math.cos(endAngleRad);
    const y3 = center + innerRadius * Math.sin(endAngleRad);
    const x4 = center + innerRadius * Math.cos(startAngleRad);
    const y4 = center + innerRadius * Math.sin(startAngleRad);
    
    const largeArc = percentage > 50 ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    cumulativePercentage += percentage;
    
    return {
      ...item,
      percentage,
      pathData,
      color: item.color || colors[index % colors.length],
      isHovered: hoveredSegment === item.category
    };
  });

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="transform transition-transform duration-300">
        {segments.map((segment, index) => (
          <g key={index}>
            <path
              d={segment.pathData}
              fill={segment.color}
              stroke="#fff"
              strokeWidth="2"
              className={`cursor-pointer transition-all duration-200 ${
                segment.isHovered ? 'brightness-110 drop-shadow-lg' : 'hover:brightness-105'
              }`}
              style={{
                transform: segment.isHovered ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: `${size/2}px ${size/2}px`
              }}
              onMouseEnter={() => setHoveredSegment(segment.category)}
              onMouseLeave={() => setHoveredSegment(null)}
              onClick={() => onSegmentClick?.(segment.category)}
            />
          </g>
        ))}
        
        {/* Center circle with total */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 5}
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="2"
        />
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="text-xs font-medium fill-gray-600"
        >
          Total
        </text>
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          className="text-sm font-bold fill-gray-900"
        >
          ${total.toFixed(0)}
        </text>
      </svg>
      
      {/* Hover tooltip */}
      {hoveredSegment && (
        <div className="absolute top-0 left-full ml-4 bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10">
          <div className="font-medium">{hoveredSegment}</div>
          <div className="text-xs opacity-90">
            ${segments.find(s => s.category === hoveredSegment)?.amount.toFixed(2)} 
            ({segments.find(s => s.category === hoveredSegment)?.percentage.toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  );
};

export default DonutChart;