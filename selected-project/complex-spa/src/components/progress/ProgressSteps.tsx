import React, { useState } from 'react';
import './ProgressSteps.css';

type Step = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

type ProgressStepsProps = {
  steps: Step[];
  variant?: 'default' | 'compact' | 'vertical';
  onStepChange?: (stepId: number) => void;
};

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  variant = 'default',
  onStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleStepClick = (stepId: number) => {
    if (onStepChange) {
      onStepChange(stepId);
    }
    setCurrentStep(stepId);
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'compact':
        return 'progress-steps-compact';
      case 'vertical':
        return 'progress-steps-vertical';
      default:
        return 'progress-steps-default';
    }
  };

  return (
    <div className={`progress-steps ${getVariantClass()}`}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`progress-step ${currentStep >= index ? 'active' : ''} ${
            step.completed ? 'completed' : ''
          }`}
          onClick={() => handleStepClick(index)}
        >
          <div className="step-indicator">
            {step.completed ? (
              <span className="step-icon">✓</span>
            ) : (
              <span className="step-number">{index + 1}</span>
            )}
          </div>
          <div className="step-content">
            <h4 className="step-title">{step.title}</h4>
            {variant !== 'compact' && (
              <p className="step-description">{step.description}</p>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className="step-connector"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;