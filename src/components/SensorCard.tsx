import React from 'react';
import { SensorCardProps } from '../types';

export function SensorCard({ title, value, unit, icon, subtitle }: SensorCardProps) {
  // Get appropriate text for boolean values based on title
  const getBooleanText = (title: string, value: boolean): string => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('light')) {
      return value ? 'On' : 'Off';
    } else if (titleLower.includes('motion')) {
      return value ? 'Detected' : 'None';
    } else {
      return value ? 'Active' : 'Inactive';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-2">
        <div className="p-3 bg-blue-50 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {typeof value === 'boolean' 
              ? getBooleanText(title, value)
              : `${value}${unit || ''}`}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}