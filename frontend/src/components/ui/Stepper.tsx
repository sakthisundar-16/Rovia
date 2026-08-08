import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full flex items-center justify-between my-6">
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <div
              className={`flex items-center gap-3 cursor-pointer ${
                onStepClick ? 'hover:opacity-80' : ''
              }`}
              onClick={() => onStepClick && onStepClick(step.id)}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#5E7A63] text-white shadow-warm-sm'
                    : isCurrent
                    ? 'bg-[#988686] text-white ring-4 ring-[#988686]/20'
                    : 'bg-[#988686]/20 text-[#5C4E4E] dark:text-[#B5A9A9]'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <div className="hidden sm:flex flex-col">
                <span
                  className={`text-xs uppercase font-semibold tracking-wider ${
                    isCurrent || isCompleted
                      ? 'text-[#000000] dark:text-white'
                      : 'text-[#5C4E4E] dark:text-[#B5A9A9]'
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-[10px] text-[#988686]">{step.description}</span>
                )}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-4 transition-all duration-300 ${
                  currentStep > step.id ? 'bg-[#5E7A63]' : 'bg-[#D1D0D0]/40 dark:bg-[#5C4E4E]/30'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
