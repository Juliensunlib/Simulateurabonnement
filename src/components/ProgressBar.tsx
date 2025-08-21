import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-gray-100 rounded-full h-3 mb-10 shadow-inner">
      <div 
        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
        style={{ width: `${progress}%` }}
      />
      <div className="flex justify-between mt-4 text-sm font-medium text-gray-700">
        <span className="font-display">Étape {currentStep} sur {totalSteps}</span>
        <span className="text-primary-600">{Math.round(progress)}% complété</span>
      </div>
    </div>
  );
};