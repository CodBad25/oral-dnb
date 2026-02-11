import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onGoToStep: (step: number) => void;
  compact?: boolean;
}

export const StepIndicator: FC<StepIndicatorProps> = ({
  currentStep,
  onGoToStep,
  compact = false,
}) => {
  const steps = [
    { number: 1, label: 'Jury' },
    { number: 2, label: 'Candidat' },
    { number: 3, label: 'Exposé' },
    { number: 4, label: 'Entretien' },
    { number: 5, label: 'Évaluation' },
    { number: 6, label: 'Résumé' },
  ];

  // On small screens, show only current/prev/next steps
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  let visibleSteps = steps;

  if (isSmallScreen) {
    const startIdx = Math.max(0, currentStep - 2);
    const endIdx = Math.min(steps.length, currentStep + 1);
    visibleSteps = steps.slice(startIdx, endIdx);
  }

  return (
    <div className={cn("w-full", compact ? "mb-2" : "mb-8")}>
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {visibleSteps.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = isCompleted;

          return (
            <div key={step.number} className="flex items-center">
              {/* Step circle */}
              <button
                onClick={() => isClickable && onGoToStep(step.number)}
                disabled={!isClickable}
                className={cn(
                  'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                  isCurrent
                    ? 'bg-indigo-500 text-white'
                    : isCompleted
                      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                      : 'bg-gray-300 text-gray-600',
                )}
              >
                {step.number}
              </button>

              {/* Connector line (except after last step) */}
              {idx < visibleSteps.length - 1 && (
                <div
                  className={cn(
                    'w-8 md:w-12 h-1 mx-1 md:mx-2 transition-colors',
                    visibleSteps[idx + 1].number <= currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step labels */}
      <div className="flex justify-between items-start mt-3 px-1">
        {visibleSteps.map((step) => {
          const isCompleted = step.number < currentStep;
          return (
            <button
              key={step.number}
              onClick={() => isCompleted && onGoToStep(step.number)}
              disabled={!isCompleted}
              className={cn(
                'text-center text-xs md:text-sm',
                isCompleted && 'cursor-pointer',
              )}
            >
              <p
                className={cn(
                  'font-medium transition-colors',
                  step.number === currentStep
                    ? 'text-indigo-600'
                    : isCompleted
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-gray-500'
                )}
              >
                {step.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
