import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  return (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-100 p-6
      ${hover ? 'hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};