import React, { useState, useEffect, useRef } from 'react';
import './App.css';

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';
type BreathingType = 'box' | 'resonant';

interface BreathingExercise {
  name: string;
  description: string;
  phases: BreathingPhase[];
  phaseDurations: { [key in BreathingPhase]: number };
  phaseLabels: { [key in BreathingPhase]: string };
}

const breathingExercises: { [key in BreathingType]: BreathingExercise } = {
  box: {
    name: 'Box Breathing',
    description: 'Inhale for 4s → Hold for 4s → Exhale for 4s → Hold for 4s',
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
  resonant: {
    name: 'Resonant Breathing',
    description: 'Inhale for 5s → Exhale for 5s',
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
  }
};

function App() {
  const [breathingType, setBreathingType] = useState<BreathingType>('box');
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
                setCycleCount(count => count + 1);
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
  }, [isActive, stepDuration, phaseDuration, currentExercise.phases]);

  const handleStartStop = () => {
    setIsActive(!isActive);
    if (!isActive) {
      // Reset to beginning when starting
      setProgress(0);
      setPhase('inhale');
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setProgress(0);
    setCycleCount(0);
  };

  const handleExerciseChange = (newType: BreathingType) => {
    // Stop current exercise and reset
    setIsActive(false);
    setBreathingType(newType);
    setPhase(breathingExercises[newType].phases[0]);
    setProgress(0);
    setCycleCount(0);
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
  };  return (
    <div className="App">
      <header className="App-header">
        <h1>☁️ Hush</h1>
        <p className="subtitle">{currentExercise.name}</p>

        {/* Exercise Selector */}
        <div className="exercise-selector">
          <button 
            className={`exercise-btn ${breathingType === 'box' ? 'active' : ''}`}
            onClick={() => handleExerciseChange('box')}
          >
            Box Breathing
          </button>
          <button 
            className={`exercise-btn ${breathingType === 'resonant' ? 'active' : ''}`}
            onClick={() => handleExerciseChange('resonant')}
          >
            Resonant Breathing
          </button>
        </div>

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
          <button className="control-btn reset" onClick={handleReset}>
            Reset
          </button>
        </div>

        <div className="stats">
          <p>Completed Cycles: <span className="cycle-count">{cycleCount}</span></p>
          <p className="instructions">
            {currentExercise.description}
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
