import React from 'react';
import { getCurrencySymbol } from '../../utils/currency';
interface DataPoint {
  date: string;
  amount: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  color = '#8B5CF6', 
  height = 200 
}) => {
  // Early return if no data or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }
const currencySymbol = getCurrencySymbol();
  // Filter out invalid data points and ensure we have valid numbers
  const validData = data.filter(point => 
    point && 
    typeof point.amount === 'number' && 
    !isNaN(point.amount) && 
    isFinite(point.amount) &&
    point.date
  );

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl">
        <p className="text-gray-500">No valid data available</p>
      </div>
    );
  }

  // Calculate safe min/max values
  const amounts = validData.map(d => d.amount);
  const maxAmount = Math.max(...amounts);
  const minAmount = Math.min(...amounts);
  const range = maxAmount - minAmount || 1; // Prevent division by zero

  const width = 600;
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  // Ensure we have at least 2 points for a line, or handle single point case
  const points = validData.map((point, index) => {
    const x = validData.length === 1 
      ? padding + chartWidth / 2 // Center single point
      : padding + (index / (validData.length - 1)) * chartWidth;
    
    const y = padding + ((maxAmount - point.amount) / range) * chartHeight;
    
    // Validate calculated coordinates
    const safeX = isFinite(x) ? x : padding;
    const safeY = isFinite(y) ? y : padding + chartHeight / 2;
    
    return { 
      x: safeX, 
      y: safeY, 
      ...point 
    };
  });

  // Generate path data safely
  const pathData = points.length === 1 
    ? `M ${points[0].x} ${points[0].y}` // Single point
    : points.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      ).join(' ');

  // Generate area data safely
  const areaData = points.length === 1
    ? `M ${points[0].x} ${points[0].y} L ${points[0].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Area fill - only render if we have valid path data */}
        {points.length > 0 && (
          <path
            d={areaData}
            fill="url(#areaGradient)"
            stroke="none"
          />
        )}
        
        {/* Line - only render if we have multiple points */}
        {points.length > 1 && (
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        
        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="3"
              className="hover:r-6 transition-all duration-200 cursor-pointer"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="12"
              fill="transparent"
              className="hover:fill-black hover:fill-opacity-5"
            />
            
            {/* Tooltip on hover */}
            <g className="opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <rect
                x={Math.max(0, Math.min(width - 70, point.x - 35))}
                y={Math.max(0, point.y - 35)}
                width="70"
                height="25"
                fill="black"
                fillOpacity="0.8"
                rx="4"
              />
              <text
                x={point.x}
                y={point.y - 18}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="500"
              >
                ${point.amount.toFixed(0)}
              </text>
            </g>
          </g>
        ))}
        
        {/* Y-axis labels - only show if we have valid range */}
        {isFinite(maxAmount) && isFinite(minAmount) && (
          <>
            <text x="10" y={padding} textAnchor="start" fill="#6b7280" fontSize="12">
              {currencySymbol +maxAmount.toFixed(0)}
            </text>
            <text x="10" y={height - padding + 5} textAnchor="start" fill="#6b7280" fontSize="12">
              {currencySymbol +minAmount.toFixed(0)}
            </text>
          </>
        )}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-10 text-xs text-gray-500">
        {validData.map((point, index) => (
          <span key={index} className={index % Math.ceil(validData.length / 6) === 0 ? '' : 'hidden sm:inline'}>
            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LineChart;