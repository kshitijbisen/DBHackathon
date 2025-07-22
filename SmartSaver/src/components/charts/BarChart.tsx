import React from 'react';

interface BarData {
  category: string;
  amount: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, height = 300 }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map(d => d.amount));
  const colors = [
    '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5A2B', '#6B46C1', '#059669', '#DC2626', '#7C2D12'
  ];

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.amount / maxAmount) * 100;
        const color = item.color || colors[index % colors.length];
        
        return (
          <div key={item.category} className="group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                {item.category}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                ${item.amount.toFixed(2)}
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color,
                    background: `linear-gradient(90deg, ${color}, ${color}dd)`
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-end pr-2">
                <span className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;