
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoadingStateProps {
  message?: string;
  showProgress?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading content...",
  showProgress = true
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center p-8 h-[50vh]">
      <Loader2 className="h-10 w-10 animate-spin text-rv-burgundy mb-4" />
      <p className="text-gray-600 font-medium mb-3">{message}</p>
      {showProgress && (
        <div className="w-64 mt-2">
          <Progress value={progress} className="h-1 w-full bg-gray-200" />
        </div>
      )}
    </div>
  );
};

export default LoadingState;
