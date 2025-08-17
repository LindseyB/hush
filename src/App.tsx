import React, { useState, useEffect, useRef } from 'react';
import './App.css';

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

function App() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Box breathing: 4 seconds each phase
  const phaseDuration = 4000; // 4 seconds
  const phaseSteps = 100; // Number of animation steps
  const stepDuration = phaseDuration / phaseSteps;

  const phases: BreathingPhase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
  const phaseLabels = {
    inhale: 'Breathe In',
    hold1: 'Hold',
    exhale: 'Breathe Out',
    hold2: 'Hold'
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // Move to next phase
            setPhase(currentPhase => {
              const currentIndex = phases.indexOf(currentPhase);
              const nextIndex = (currentIndex + 1) % phases.length;

              // If we completed a full cycle (back to inhale), increment count
              if (nextIndex === 0) {
                setCycleCount(count => count + 1);
              }

              return phases[nextIndex];
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
  }, [isActive, stepDuration]);

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

  return (
    <div className="App">
      <header className="App-header">
        <h1>☁️ Hush</h1>
        <p className="subtitle">Box Breathing Exercise</p>

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
            <h2 className="phase-label">{phaseLabels[phase]}</h2>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="timer">{Math.ceil((100 - progress) / 25)} seconds</p>
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
            Box breathing: Inhale for 4s → Hold for 4s → Exhale for 4s → Hold for 4s
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;
