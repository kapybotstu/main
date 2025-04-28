import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface ChartWidgetProps {
  data: {
    type: string;
    icon: any;
    data: ChartData[];
  };
}

const ChartWidget: React.FC<ChartWidgetProps> = ({ data }) => {
  const Icon = data.icon;
  const total = data.data.reduce((sum, item) => sum + item.value, 0);

  // Simple pie chart implementation
  const renderPieChart = () => {
    let cumulativePercentage = 0;
    
    return (
      <div className="flex justify-center mb-3">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {data.data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = cumulativePercentage;
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeDashoffset={`${-startAngle}`}
                  className="transition-all duration-500 ease-in-out"
                />
              );
            })}
            <circle cx="50" cy="50" r="30" fill="white" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-gold/10 text-jobby-gold mr-3">
          <Icon size={20} />
        </div>
        <span className="text-sm text-jobby-gray-600">Statistics</span>
      </div>
      
      {data.type === 'pie' && renderPieChart()}
      
      <div className="space-y-2">
        {data.data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-jobby-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.value}</span>
              <span className="text-xs text-jobby-gray-500">
                ({((item.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartWidget;