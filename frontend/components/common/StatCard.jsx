import React, { useEffect, useState } from 'react';

export default function StatCard({ 
  title, 
  value, 
  icon, 
  trend = null, 
  color = 'blue',
  animated = true,
  onClick = null,
  subtitle = null 
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const increment = Math.ceil(value / 50);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [value, animated]);

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:shadow-lg',
    green: 'bg-green-50 text-green-600 border-green-200 hover:shadow-lg',
    red: 'bg-red-50 text-red-600 border-red-200 hover:shadow-lg',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:shadow-lg',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:shadow-lg',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:shadow-lg',
  };

  const trendColor = trend && trend.isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div
      className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${colorMap[color] || colorMap.blue}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{displayValue.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 ${trendColor} text-sm font-semibold`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.percentage)}%</span>
              <span className="text-gray-500 text-xs ml-1">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl opacity-80">{icon}</div>
        )}
      </div>
    </div>
  );
}
