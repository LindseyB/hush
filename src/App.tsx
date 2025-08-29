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
  const [isRaining, setIsRaining] = useState(false);
  const [useShapes, setUseShapes] = useState(true); // Toggle between shapes and circles
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Toggle for settings menu
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

      if (timerRef.current) {
        clearInterval(timerRef.current);
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

  const toggleRain = () => {
    setIsRaining(!isRaining);

    if (!isRaining) {
      // Start rain
      if (!audioRef.current) {
        // Fallback approach for PUBLIC_URL
        const publicUrl = process.env.PUBLIC_URL || (window.location.pathname !== '/' ? window.location.pathname.replace(/\/$/, '') : '');
        const audioPath = `${publicUrl}/audio/531947__straget__the-rain-falls-against-the-parasol.wav`;
        audioRef.current = new Audio(audioPath);
        audioRef.current.loop = true;
      }
      audioRef.current.play();
    } else {
      // Stop rain
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  // Calculate circle properties for animation (kept for backward compatibility)
  const getCircleRadius = () => {
    const baseRadius = 80;
    const maxRadius = 180;

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

  // Calculate animation position for different breathing shapes
  const getAnimationPosition = () => {
    // Calculate the total progress based on which phase we're in and progress within that phase
    let totalProgress = 0;
    const phasesInOrder = currentExercise.phases;
    const currentPhaseIndex = phasesInOrder.indexOf(phase);

    // Add completed phases
    for (let i = 0; i < currentPhaseIndex; i++) {
      const phaseDur = currentExercise.phaseDurations[phasesInOrder[i]];
      if (phaseDur > 0) {
        totalProgress += 25; // Each phase gets 25% (assuming max 4 phases)
      }
    }

    // Add current phase progress
    const currentPhaseDuration = currentExercise.phaseDurations[phase];
    if (currentPhaseDuration > 0) {
      const phaseWeight = 100 / phasesInOrder.filter(p => currentExercise.phaseDurations[p] > 0).length;
      totalProgress += (progress / 100) * phaseWeight;
    }

    return Math.min(totalProgress, 100);
  };

  // Render breathing shape based on type
  const renderBreathingShape = () => {
    if (!useShapes) {
      // Return original circle animation when shapes are disabled
      return (
        <circle
          cx="200"
          cy="200"
          r={getCircleRadius()}
          fill={`rgba(100, 200, 255, ${getCircleOpacity()})`}
          stroke="rgba(100, 200, 255, 0.8)"
          strokeWidth="3"
          className="breathing-circle"
        />
      );
    }

    // Return shape-based animations when shapes are enabled
    const animationProgress = getAnimationPosition();

    switch (breathingType) {
      case 'box':
        return renderBoxBreathing(animationProgress);
      case 'triangle':
        return renderTriangleBreathing(animationProgress);
      case 'resonant':
        return renderResonantBreathing(animationProgress);
      case 'four-seven-eight':
        return renderFourSevenEightBreathing(animationProgress);
      default:
        return renderDefaultCircle();
    }
  };

  const renderBoxBreathing = (animationProgress: number) => {
    const size = 260;  // Increased by 30% from 200 to 260
    const centerX = 200;  // Updated center for new viewBox
    const centerY = 200;  // Updated center for new viewBox
    const halfSize = size / 2;

    // Define the four corners of the box
    const corners = [
      { x: centerX - halfSize, y: centerY - halfSize }, // top-left
      { x: centerX + halfSize, y: centerY - halfSize }, // top-right
      { x: centerX + halfSize, y: centerY + halfSize }, // bottom-right
      { x: centerX - halfSize, y: centerY + halfSize }  // bottom-left
    ];

    // Calculate dot position based on current phase and progress
    const getDotPosition = () => {
      const sideProgress = progress / 100;

      if (phase === 'inhale') {
        // Top edge (left to right)
        return {
          x: corners[0].x + (corners[1].x - corners[0].x) * sideProgress,
          y: corners[0].y
        };
      } else if (phase === 'hold1') {
        // Right edge (top to bottom)
        return {
          x: corners[1].x,
          y: corners[1].y + (corners[2].y - corners[1].y) * sideProgress
        };
      } else if (phase === 'exhale') {
        // Bottom edge (right to left)
        return {
          x: corners[2].x - (corners[2].x - corners[3].x) * sideProgress,
          y: corners[2].y
        };
      } else { // hold2
        // Left edge (bottom to top)
        return {
          x: corners[3].x,
          y: corners[3].y - (corners[3].y - corners[0].y) * sideProgress
        };
      }
    };

    const dotPos = getDotPosition();

    return (
      <>
        {/* Box outline */}
        <rect
          x={centerX - halfSize}
          y={centerY - halfSize}
          width={size}
          height={size}
          fill="none"
          stroke="rgba(100, 200, 255, 0.8)"
          strokeWidth="3"
        />

        {/* Corner dots */}
        {corners.map((corner, index) => (
          <circle
            key={index}
            cx={corner.x}
            cy={corner.y}
            r="4"
            fill="rgba(255, 255, 255, 0.6)"
          />
        ))}

        {/* Moving dot */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r="6"
          fill="rgba(100, 200, 255, 1)"
        />
      </>
    );
  };

  const renderTriangleBreathing = (animationProgress: number) => {
    const size = 312;  // Increased by 30% from 240 to 312
    const centerX = 200;  // Updated center for new viewBox
    const centerY = 200;  // Updated center for new viewBox
    const height = (size * Math.sqrt(3)) / 2;

    // Define the three points of an equilateral triangle
    const points = [
      { x: centerX, y: centerY - height * 2/3 },           // top
      { x: centerX - size/2, y: centerY + height * 1/3 },  // bottom-left
      { x: centerX + size/2, y: centerY + height * 1/3 }   // bottom-right
    ];

    // Calculate dot position based on current phase
    const getDotPosition = () => {
      const sideProgress = progress / 100;

      if (phase === 'inhale') {
        // Bottom-left to top
        return {
          x: points[1].x + (points[0].x - points[1].x) * sideProgress,
          y: points[1].y + (points[0].y - points[1].y) * sideProgress
        };
      } else if (phase === 'hold1') {
        // Top to bottom-right
        return {
          x: points[0].x + (points[2].x - points[0].x) * sideProgress,
          y: points[0].y + (points[2].y - points[0].y) * sideProgress
        };
      } else { // exhale
        // Bottom-right to bottom-left
        return {
          x: points[2].x + (points[1].x - points[2].x) * sideProgress,
          y: points[2].y + (points[1].y - points[2].y) * sideProgress
        };
      }
    };

    const dotPos = getDotPosition();

    return (
      <>
        {/* Triangle outline */}
        <polygon
          points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y}`}
          fill="none"
          stroke="rgba(100, 200, 255, 0.8)"
          strokeWidth="3"
        />

        {/* Corner dots */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="rgba(255, 255, 255, 0.6)"
          />
        ))}

        {/* Moving dot */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r="6"
          fill="rgba(100, 200, 255, 1)"
        />
      </>
    );
  };

  const renderResonantBreathing = (animationProgress: number) => {
    const lineWidth = 300;  // Increased from 200 to 300
    const centerX = 200;  // Updated center for new viewBox
    const centerY = 200;  // Updated center for new viewBox
    const startX = centerX - lineWidth / 2;
    const endX = centerX + lineWidth / 2;

    // Calculate dot position (back and forth along the line based on phase)
    const getDotPosition = () => {
      const sideProgress = progress / 100;

      if (phase === 'inhale') {
        // Move from left to right
        return startX + (endX - startX) * sideProgress;
      } else { // exhale
        // Move from right to left
        return endX - (endX - startX) * sideProgress;
      }
    };

    const dotX = getDotPosition();

    return (
      <>
        {/* Horizontal line */}
        <line
          x1={startX}
          y1={centerY}
          x2={endX}
          y2={centerY}
          stroke="rgba(100, 200, 255, 0.8)"
          strokeWidth="3"
        />

        {/* End points */}
        <circle
          cx={startX}
          cy={centerY}
          r="4"
          fill="rgba(255, 255, 255, 0.6)"
        />
        <circle
          cx={endX}
          cy={centerY}
          r="4"
          fill="rgba(255, 255, 255, 0.6)"
        />

        {/* Moving dot */}
        <circle
          cx={dotX}
          cy={centerY}
          r="6"
          fill="rgba(100, 200, 255, 1)"
        />
      </>
    );
  };

  const renderFourSevenEightBreathing = (animationProgress: number) => {
    const centerX = 200;  // Updated center for new viewBox
    const centerY = 200;  // Updated center for new viewBox
    const radius = 312;  // Increased by 30% from 240 to 312

    // For a proper Reuleaux triangle, the distance between vertices equals the radius
    // The three vertices of the equilateral triangle (centers of the arcs)
    const sideLength = radius;
    const height = sideLength * Math.sqrt(3) / 2;

    const vertices = [
      { x: centerX, y: centerY - height * 2/3 },                    // top
      { x: centerX - sideLength / 2, y: centerY + height / 3 },     // bottom-left
      { x: centerX + sideLength / 2, y: centerY + height / 3 }      // bottom-right
    ];

    // The corners of the Reuleaux triangle (where the arcs meet)
    const corners = [
      { x: centerX - sideLength / 2, y: centerY + height / 3 },     // left corner
      { x: centerX + sideLength / 2, y: centerY + height / 3 },     // right corner
      { x: centerX, y: centerY - height * 2/3 }                     // top corner
    ];

    // Calculate dot position based on current phase
    const getDotPosition = () => {
      const t = progress / 100;

      if (phase === 'inhale') {
        // Arc from left corner to top corner (centered at bottom-right vertex)
        const center = vertices[2]; // bottom-right vertex
        // Calculate angle from center to left corner
        const startAngle = Math.atan2(corners[0].y - center.y, corners[0].x - center.x);
        // Calculate angle from center to top corner
        const endAngle = Math.atan2(corners[2].y - center.y, corners[2].x - center.x);

        // Ensure we go the shorter way around the circle
        let deltaAngle = endAngle - startAngle;
        if (deltaAngle > Math.PI) {
          deltaAngle -= 2 * Math.PI;
        } else if (deltaAngle < -Math.PI) {
          deltaAngle += 2 * Math.PI;
        }

        const angle = startAngle + deltaAngle * t;

        return {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle)
        };
      } else if (phase === 'hold1') {
        // Arc from top corner to right corner (centered at bottom-left vertex)
        const center = vertices[1]; // bottom-left vertex
        const startAngle = Math.atan2(corners[2].y - center.y, corners[2].x - center.x);
        const endAngle = Math.atan2(corners[1].y - center.y, corners[1].x - center.x);

        // Ensure we go the shorter way around the circle
        let deltaAngle = endAngle - startAngle;
        if (deltaAngle > Math.PI) {
          deltaAngle -= 2 * Math.PI;
        } else if (deltaAngle < -Math.PI) {
          deltaAngle += 2 * Math.PI;
        }

        const angle = startAngle + deltaAngle * t;

        return {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle)
        };
      } else if (phase === 'exhale') {
        // Arc from right corner to left corner (centered at top vertex)
        const center = vertices[0]; // top vertex
        const startAngle = Math.atan2(corners[1].y - center.y, corners[1].x - center.x);
        const endAngle = Math.atan2(corners[0].y - center.y, corners[0].x - center.x);

        // For this arc, we want to go the long way around (clockwise from right to left)
        let deltaAngle = endAngle - startAngle;
        if (deltaAngle < 0) {
          deltaAngle += 2 * Math.PI;
        }

        const angle = startAngle + deltaAngle * t;

        return {
          x: center.x + radius * Math.cos(angle),
          y: center.y + radius * Math.sin(angle)
        };
      }

      return corners[0]; // default to left corner
    };

    const dotPos = getDotPosition();

    return (
      <>
        {/* Reuleaux triangle using three circular arcs */}
        <path
          d={`M ${corners[0].x} ${corners[0].y}
              A ${radius} ${radius} 0 0 1 ${corners[2].x} ${corners[2].y}
              A ${radius} ${radius} 0 0 1 ${corners[1].x} ${corners[1].y}
              A ${radius} ${radius} 0 0 1 ${corners[0].x} ${corners[0].y} Z`}
          fill="none"
          stroke="rgba(100, 200, 255, 0.8)"
          strokeWidth="3"
        />

        {/* Highlight the active arc */}
        {phase === 'inhale' && (
          <path
            d={`M ${corners[0].x} ${corners[0].y}
                A ${radius} ${radius} 0 0 1 ${corners[2].x} ${corners[2].y}`}
            fill="none"
            stroke="rgba(100, 200, 255, 1)"
            strokeWidth="5"
            opacity="0.7"
          />
        )}

        {phase === 'hold1' && (
          <path
            d={`M ${corners[2].x} ${corners[2].y}
                A ${radius} ${radius} 0 0 1 ${corners[1].x} ${corners[1].y}`}
            fill="none"
            stroke="rgba(100, 200, 255, 1)"
            strokeWidth="5"
            opacity="0.7"
          />
        )}

        {phase === 'exhale' && (
          <path
            d={`M ${corners[1].x} ${corners[1].y}
                A ${radius} ${radius} 0 0 1 ${corners[0].x} ${corners[0].y}`}
            fill="none"
            stroke="rgba(100, 200, 255, 1)"
            strokeWidth="5"
            opacity="0.7"
          />
        )}

        {/* Corner dots */}
        <circle cx={corners[0].x} cy={corners[0].y} r="4" fill="rgba(255, 255, 255, 0.6)" />
        <circle cx={corners[1].x} cy={corners[1].y} r="4" fill="rgba(255, 255, 255, 0.6)" />
        <circle cx={corners[2].x} cy={corners[2].y} r="4" fill="rgba(255, 255, 255, 0.6)" />

        {/* Moving dot */}
        <circle
          cx={dotPos.x}
          cy={dotPos.y}
          r="6"
          fill="rgba(100, 200, 255, 1)"
        />
      </>
    );
  };

  const renderDefaultCircle = () => {
    return (
      <circle
        cx="200"
        cy="200"
        r={getCircleRadius()}
        fill={`rgba(100, 200, 255, ${getCircleOpacity()})`}
        stroke="rgba(100, 200, 255, 0.8)"
        strokeWidth="3"
        className="breathing-circle"
      />
    );
  };

  const getTimerDisplay = () => {
    if (phaseDuration === 0) return '';
    return `${Math.ceil((100 - progress) / (100 / (phaseDuration / 1000)))} seconds`;
  };
  return (
    <div className="App">
      {/* Rain particles */}
      {isRaining && (
        <div className="rain-container">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="raindrop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${0.5 + Math.random() * 0.3}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <header className="App-header">
        <h1>
          <span className="cloud-emoji" onClick={toggleRain} title={isRaining ? "Stop rain" : "Make it rain"}>
            ☁️
          </span>{' '}
          Hush
        </h1>
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

        {/* Collapsible Settings Menu */}
        <div className="settings-menu">
          <button
            className="settings-toggle"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-expanded={isSettingsOpen}
          >
            ⚙️ Settings
            <span className={`arrow ${isSettingsOpen ? 'open' : ''}`}>▼</span>
          </button>

          <div className={`settings-content ${isSettingsOpen ? 'open' : ''}`}>
            {/* Visualization Mode Toggle */}
            <div className="visualization-toggle">
              <label className="toggle-label">
                Visualization Mode:
              </label>
              <div className="toggle-buttons">
                <button
                  className={`toggle-btn ${useShapes ? 'active' : ''}`}
                  onClick={() => setUseShapes(true)}
                  disabled={isActive}
                >
                  🔺 Shapes
                </button>
                <button
                  className={`toggle-btn ${!useShapes ? 'active' : ''}`}
                  onClick={() => setUseShapes(false)}
                  disabled={isActive}
                >
                  ⭕ Circle
                </button>
              </div>
            </div>

            {/* Timer Settings - Only show for non-4-7-8 exercises */}
            {breathingType !== 'four-seven-eight' && (
              <div className="timer-section">
                <div className={`timer-controls ${isActive ? 'faded' : ''}`}>
                  <label htmlFor="timer-minutes">Session Duration:</label>
                  <div className="timer-inputs">
                    <button
                      className={`timer-btn ${timerMinutes === 0 ? 'selected' : ''}`}
                      onClick={() => setTimerMinutes(0)}
                      disabled={isActive}
                    >
                      ∞
                    </button>
                    <button
                      className={`timer-btn ${timerMinutes === 1 ? 'selected' : ''}`}
                      onClick={() => setTimerMinutes(1)}
                      disabled={isActive}
                    >
                      1m
                    </button>
                    <button
                      className={`timer-btn ${timerMinutes === 3 ? 'selected' : ''}`}
                      onClick={() => setTimerMinutes(3)}
                      disabled={isActive}
                    >
                      3m
                    </button>
                    <button
                      className={`timer-btn ${timerMinutes === 5 ? 'selected' : ''}`}
                      onClick={() => setTimerMinutes(5)}
                      disabled={isActive}
                    >
                      5m
                    </button>
                    <button
                      className={`timer-btn ${timerMinutes === 10 ? 'selected' : ''}`}
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
          </div>
        </div>

        <div className="breathing-container">
          <div className="breathing-visual">
            <svg width="400" height="400" viewBox="0 0 400 400">
              {/* Background circle - only show in circle mode */}
              {!useShapes && (
                <circle
                  cx="200"
                  cy="200"
                  r="180"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="2"
                />
              )}

              {/* Animated breathing shapes */}
              {renderBreathingShape()}
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

      <footer className="attribution">
        <p>
          "The rain falls against the parasol" by straget —{' '}
          <a
            href="https://freesound.org/s/531947/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://freesound.org/s/531947/
          </a>
          {' '}— License: Attribution 4.0
        </p>
      </footer>
    </div>
  );
}

export default App;
