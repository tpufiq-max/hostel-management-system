import React from 'react';

export default function ProgressBar({ 
  percentage = 0, 
  color = 'blue',
  showLabel = true,
  animated = true,
  height = 'h-3'
}) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-400',
    green: 'from-green-500 to-green-400',
    red: 'from-red-500 to-red-400',
    yellow: 'from-yellow-500 to-yellow-400',
    purple: 'from-purple-500 to-purple-400',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
        <div
          className={`bg-gradient-to-r ${colorMap[color]} ${height} rounded-full transition-all duration-500 ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {showLabel && (
        <p className="text-xs text-gray-600 mt-1 font-semibold">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}
