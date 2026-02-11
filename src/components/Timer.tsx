import type { FC } from 'react';
import { Play, Pause, RotateCcw, Square } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { cn } from '@/lib/utils';

interface TimerProps {
  title: string;
  initialMinutes: number;
  onComplete: (elapsedSeconds: number) => void;
  candidateInfo?: string;
}

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const Timer: FC<TimerProps> = ({
  title,
  initialMinutes,
  onComplete,
  candidateInfo,
}) => {
  const timer = useTimer(initialMinutes);

  const handleDurationIncrease = () => {
    if (!timer.isRunning) {
      timer.setDuration(Math.floor(timer.initialSeconds / 60) + 1);
    }
  };

  const handleDurationDecrease = () => {
    if (!timer.isRunning && timer.initialSeconds > 60) {
      timer.setDuration(Math.floor(timer.initialSeconds / 60) - 1);
    }
  };

  const handleStop = () => {
    timer.pause();
  };

  const handleComplete = () => {
    timer.pause();
    onComplete(timer.elapsedSeconds);
  };

  const durationMinutes = Math.floor(timer.initialSeconds / 60);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {candidateInfo && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            {candidateInfo}
          </p>
        </div>
      )}

      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        {title}
      </h2>

      {/* Timer display */}
      <div
        className={cn(
          'rounded-2xl p-8 md:p-12 mb-8 transition-all',
          timer.isOvertime
            ? 'bg-red-100 dark:bg-red-900/50 ring-4 ring-red-400 dark:ring-red-600'
            : timer.isAlert
              ? 'bg-orange-100 dark:bg-orange-900/50 ring-2 ring-orange-400'
              : 'bg-white dark:bg-gray-800'
        )}
      >
        <div className={cn(
          "text-6xl md:text-8xl font-bold text-center font-mono tracking-wider",
          timer.isOvertime
            ? "text-red-600 dark:text-red-400"
            : timer.isAlert
              ? "text-orange-600 dark:text-orange-400"
              : "text-gray-900 dark:text-white"
        )}>
          {timer.timeString}
        </div>
        {timer.isOvertime && (
          <p className="text-center text-red-600 dark:text-red-400 font-semibold mt-3 text-lg">
            Temps dépassé
          </p>
        )}
        {timer.elapsedSeconds > 0 && !timer.isOvertime && (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-3">
            Écoulé : {formatDuration(timer.elapsedSeconds)}
          </p>
        )}
      </div>

      {/* Duration adjuster - only before starting */}
      {timer.elapsedSeconds === 0 && (
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handleDurationDecrease}
            disabled={timer.isRunning || durationMinutes <= 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
          >
            −
          </button>
          <div className="text-lg font-semibold text-gray-900 dark:text-white min-w-12 text-center">
            {durationMinutes} min
          </div>
          <button
            onClick={handleDurationIncrease}
            disabled={timer.isRunning}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
          >
            +
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {!timer.isRunning ? (
          <button
            onClick={timer.start}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
            title="Démarrer"
          >
            <Play size={24} />
          </button>
        ) : (
          <>
            <button
              onClick={timer.pause}
              className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
              title="Pause"
            >
              <Pause size={24} />
            </button>
            <button
              onClick={handleStop}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              title="Arrêter"
            >
              <Square size={24} />
            </button>
          </>
        )}
        {!timer.isRunning && timer.elapsedSeconds > 0 && (
          <button
            onClick={timer.reset}
            className="p-3 bg-gray-400 hover:bg-gray-500 text-white rounded-full transition-colors"
            title="Réinitialiser"
          >
            <RotateCcw size={24} />
          </button>
        )}
      </div>

      {/* Complete button */}
      <div className="flex justify-center">
        <button
          onClick={handleComplete}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
        >
          Passer à l'étape suivante
        </button>
      </div>
    </div>
  );
};
