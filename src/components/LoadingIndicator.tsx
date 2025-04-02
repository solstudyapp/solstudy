
import React from 'react';
import { Progress } from './ui/progress';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">SolStudy</h2>
        <Progress value={33} className="mb-4" />
        <p className="text-center text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
