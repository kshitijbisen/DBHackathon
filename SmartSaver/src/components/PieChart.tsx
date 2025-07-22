import React from 'react';

interface PieChartProps {
  data: { [key: string]: number };
  colors: string[];
}

const PieChart: React.FC<PieChartProps> = ({ data, colors }) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-full">
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }
  
  let cumulativePercentage = 0;
  const radius = 100;
  const center = 120;
  
  const segments = Object.entries(data).map(([category, value], index) => {
    const percentage = (value / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArc = percentage > 50 ? 1 : 0;
    
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    cumulativePercentage += percentage;
    
    return {
      category,
      value,
      percentage,
      pathData,
      color: colors[index % colors.length]
    };
  });
  
  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="240" className="mb-4">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.pathData}
            fill={segment.color}
            stroke="#fff"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity duration-200"
          />
        ))}
      </svg>
      
      <div className="flex flex-wrap justify-center gap-4">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm font-medium text-gray-700">
              {segment.category}: ${segment.value.toFixed(2)} ({segment.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;