import React, { useState, useEffect, useRef } from 'react';
import './App.css';

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';
type BreathingType = 'box' | 'resonant' | 'four-seven-eight' | 'triangle';

interface BreathingExercise {
  name: string;
  description: string;
  patternTiming: string;
  phases: BreathingPhase[];
  phaseDurations: { [key in BreathingPhase]: number };
  phaseLabels: { [key in BreathingPhase]: string };
  instructions?: string[];
  maxCycles?: number;
}

const breathingExercises: { [key in BreathingType]: BreathingExercise } = {
  box: {
    name: 'Box Breathing',
    description: 'Perfect for focus and stress relief. Used by Navy SEALs and professionals to stay calm under pressure. Great for anxiety and building mental clarity.',
    patternTiming: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s',
    phases: ['inhale', 'hold1', 'exhale', 'hold2'],
    phaseDurations: {
      inhale: 4000,
      hold1: 4000,
      exhale: 4000,
      hold2: 4000
    },
    phaseLabels: {
      inhale: 'Breathe In',
      hold1: 'Hold',
      exhale: 'Breathe Out',
      hold2: 'Hold'
    }
  },
  triangle: {
    name: 'Triangle Breathing',
    description: 'Simple and effective for beginners. Great for quick stress relief and centering yourself. Perfect when you need a fast reset during busy moments.',
    patternTiming: 'Inhale 3s → Hold 3s → Exhale 3s',
    phases: ['inhale', 'hold1', 'exhale'],
    phaseDurations: {
      inhale: 3000,
      hold1: 3000,
      exhale: 3000,
      hold2: 0
    },
    phaseLabels: {
      inhale: 'Breathe In',
      hold1: 'Hold',
      exhale: 'Breathe Out',
      hold2: ''
    }
  },
  resonant: {
    name: 'Resonant Breathing',
    description: 'Optimizes heart rate variability and activates your body\'s natural healing response. Excellent for reducing anxiety, improving sleep, and building emotional resilience.',
    patternTiming: 'Inhale 5s → Exhale 5s',
    phases: ['inhale', 'exhale'],
    phaseDurations: {
      inhale: 5000,
      hold1: 0,
      exhale: 5000,
      hold2: 0
    },
    phaseLabels: {
      inhale: 'Breathe In',
      hold1: '',
      exhale: 'Breathe Out',
      hold2: ''
    }
  },
  'four-seven-eight': {
    name: '4-7-8 Breathing',
    description: 'Known as the "natural tranquilizer" - powerful for falling asleep quickly and managing intense anxiety or panic. Based on ancient pranayama techniques.',
    patternTiming: 'Inhale 4s → Hold 7s → Exhale 8s',
    phases: ['inhale', 'hold1', 'exhale'],
    phaseDurations: {
      inhale: 4000,
      hold1: 7000,
      exhale: 8000,
      hold2: 0
    },
    phaseLabels: {
      inhale: 'Breathe In (nose)',
      hold1: 'Hold',
      exhale: 'Breathe Out (mouth)',
      hold2: ''
    },
    instructions: [
      'Sit comfortably with a straight back (or lie down if preparing for sleep)',
      'Rest your tongue gently against the roof of your mouth, behind your front teeth',
      'Breathe in silently through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Breathe out forcefully through your mouth for 8 counts, making a "whoosh" sound',
      'Beginners should only do 4 cycles at first'
    ],
    maxCycles: 8
  }
};

function App() {
  const [breathingType, setBreathingType] = useState<BreathingType>('box');
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState<number>(0); // 0 means no timer
  const [remainingTime, setRemainingTime] = useState<number>(0); // in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentExercise = breathingExercises[breathingType];
  const phaseDuration = currentExercise.phaseDurations[phase];
  const phaseSteps = 100; // Number of animation steps
  const stepDuration = phaseDuration / phaseSteps;

  useEffect(() => {
    if (isActive && phaseDuration > 0) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // Move to next phase
            setPhase(currentPhase => {
              const currentIndex = currentExercise.phases.indexOf(currentPhase);
              const nextIndex = (currentIndex + 1) % currentExercise.phases.length;

              // If we completed a full cycle (back to first phase), increment count
              if (nextIndex === 0) {
                setCycleCount(count => {
                  const newCount = count + 1;
                  // Auto-stop if reached maximum cycles (only for 4-7-8)
                  if (currentExercise.maxCycles && newCount >= currentExercise.maxCycles) {
                    setIsActive(false);
                  }
                  return newCount;
                });
              }

              return currentExercise.phases[nextIndex];
            });
            return 0;
          }
          return prev + 1;
        });
      }, stepDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, stepDuration, phaseDuration, currentExercise.phases, currentExercise.maxCycles]);

  // Timer countdown effect
  useEffect(() => {
    if (isActive && timerMinutes > 0 && breathingType !== 'four-seven-eight') {
      if (remainingTime === 0) {
        setRemainingTime(timerMinutes * 60);
      }

      timerRef.current = setInterval(() => {
        setRemainingTime(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timerMinutes, breathingType, remainingTime]);

  const handleStartStop = () => {
    setIsActive(!isActive);
    if (!isActive) {
      // Reset to beginning when starting
      setProgress(0);
      setPhase('inhale');
      if (timerMinutes > 0 && breathingType !== 'four-seven-eight') {
        setRemainingTime(timerMinutes * 60);
      }
    }
  };

  const handleExerciseChange = (newType: BreathingType) => {
    // Stop current exercise and reset
    setIsActive(false);
    setBreathingType(newType);
    setPhase(breathingExercises[newType].phases[0]);
    setProgress(0);
    setCycleCount(0);
    setRemainingTime(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate circle properties for animation
  const getCircleRadius = () => {
    const baseRadius = 60;
    const maxRadius = 120;

    if (phase === 'inhale') {
      return baseRadius + (maxRadius - baseRadius) * (progress / 100);
    } else if (phase === 'exhale') {
      return maxRadius - (maxRadius - baseRadius) * (progress / 100);
    }
    return phase === 'hold1' ? maxRadius : baseRadius;
  };

  const getCircleOpacity = () => {
    if (phase === 'inhale' || phase === 'exhale') {
      return 0.3 + 0.7 * Math.sin((progress / 100) * Math.PI);
    }
    return phase === 'hold1' ? 1 : 0.3;
  };

  const getTimerDisplay = () => {
    if (phaseDuration === 0) return '';
    return `${Math.ceil((100 - progress) / (100 / (phaseDuration / 1000)))} seconds`;
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>☁️ Hush</h1>
        <p className="subtitle">{currentExercise.name}</p>

        {/* Breathing pattern timing */}
        <div className="breathing-pattern">
          <p className="pattern-timing">
            {currentExercise.patternTiming}
          </p>
        </div>

        {/* Exercise Selector */}
        <div className="exercise-selector">
          <button
            className={`exercise-btn ${breathingType === 'box' ? 'active' : ''}`}
            onClick={() => handleExerciseChange('box')}
          >
            Box Breathing
          </button>
          <button
            className={`exercise-btn ${breathingType === 'triangle' ? 'active' : ''}`}
            onClick={() => handleExerciseChange('triangle')}
          >
            Triangle Breathing
          </button>
          <button
            className={`exercise-btn ${breathingType === 'resonant' ? 'active' : ''}`}
            onClick={() => handleExerciseChange('resonant')}
          >
            Resonant Breathing
          </button>
          <button
            className={`exercise-btn ${breathingType === 'four-seven-eight' ? 'active' : ''}`}
            onClick={() => handleExerciseChange('four-seven-eight')}
          >
            4-7-8 Breathing
          </button>
        </div>

        {/* Timer Settings - Only show for non-4-7-8 exercises */}
        {breathingType !== 'four-seven-eight' && (
          <div className="timer-section">
            <div className={`timer-controls ${isActive ? 'faded' : ''}`}>
              <label htmlFor="timer-minutes">Session Duration:</label>
              <div className="timer-inputs">
                <button
                  className="timer-btn"
                  onClick={() => setTimerMinutes(0)}
                  disabled={isActive}
                >
                  ∞
                </button>
                <button
                  className="timer-btn"
                  onClick={() => setTimerMinutes(1)}
                  disabled={isActive}
                >
                  1m
                </button>
                <button
                  className="timer-btn"
                  onClick={() => setTimerMinutes(3)}
                  disabled={isActive}
                >
                  3m
                </button>
                <button
                  className="timer-btn"
                  onClick={() => setTimerMinutes(5)}
                  disabled={isActive}
                >
                  5m
                </button>
                <button
                  className="timer-btn"
                  onClick={() => setTimerMinutes(10)}
                  disabled={isActive}
                >
                  10m
                </button>
              </div>
            </div>
            {timerMinutes > 0 && remainingTime > 0 && (
              <p className="timer-display">Time remaining: {formatTime(remainingTime)}</p>
            )}
          </div>
        )}

        <div className="breathing-container">
          <div className="breathing-visual">
            <svg width="300" height="300" viewBox="0 0 300 300">
              {/* Background circle */}
              <circle
                cx="150"
                cy="150"
                r="130"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
              />

              {/* Animated breathing circle */}
              <circle
                cx="150"
                cy="150"
                r={getCircleRadius()}
                fill={`rgba(100, 200, 255, ${getCircleOpacity()})`}
                stroke="rgba(100, 200, 255, 0.8)"
                strokeWidth="3"
                className="breathing-circle"
              />

              {/* Center dot */}
              <circle
                cx="150"
                cy="150"
                r="4"
                fill="white"
                opacity="0.8"
              />
            </svg>
          </div>

          <div className="breathing-info">
            <h2 className="phase-label">{currentExercise.phaseLabels[phase]}</h2>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="timer">{getTimerDisplay()}</p>
          </div>
        </div>

        <div className="controls">
          <button
            className={`control-btn ${isActive ? 'stop' : 'start'}`}
            onClick={handleStartStop}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
        </div>

        <div className="stats">
          <p>Completed Cycles: <span className="cycle-count">{cycleCount}</span>
            {currentExercise.maxCycles && (
              <span className="max-cycles"> / {currentExercise.maxCycles} max</span>
            )}
          </p>
          <p className={`instructions ${isActive ? 'faded' : ''}`}>
            {currentExercise.description}
          </p>

          {/* Show warning for 4-7-8 breathing if approaching/at limit */}
          {breathingType === 'four-seven-eight' && cycleCount >= 4 && (
            <div className="cycle-warning">
              {cycleCount >= 8 ? (
                <p className="warning-text">⚠️ You've reached the maximum recommended cycles. Take a break!</p>
              ) : cycleCount >= 4 ? (
                <p className="warning-text">💡 Beginners should stop at 4 cycles. Advanced practitioners can continue to 8.</p>
              ) : (
                <p className="warning-text">💡 Beginners should stop at 4 cycles. Advanced practitioners can continue to 8.</p>
              )}
            </div>
          )}

          {/* Show instructions for 4-7-8 breathing */}
          {breathingType === 'four-seven-eight' && (
            <div className={`exercise-instructions ${isActive ? 'faded' : ''}`}>
              <h3>Important Instructions:</h3>
              <ul>
                {currentExercise.instructions?.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
              <p className="note">
                <strong>Note:</strong> If you feel lightheaded, this is normal for beginners.
                Start with only 4 cycles and gradually work up to 8 as you become comfortable.
              </p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
