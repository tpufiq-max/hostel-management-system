import React, { useState } from 'react';

export default function Tabs({ 
  tabs = [],
  defaultTab = 0,
  onChange = null
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index);
  };

  return (
    <div className="w-full">
      {/* Tab buttons */}
      <div className="flex border-b-2 border-gray-200 gap-0">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`px-6 py-3 font-semibold transition-all border-b-2 -mb-0.5 ${
              activeTab === index
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
