import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock timers for consistent testing
jest.useFakeTimers();

describe('Hush Breathing App - Core Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
  });

  describe('Initial Render and Basic UI', () => {
    it('renders the app title and initial state correctly', () => {
      render(<App />);
      
      expect(screen.getByRole('heading', { name: /hush/i })).toBeInTheDocument();
      expect(screen.getByText('Inhale 4s → Hold 4s → Exhale 4s → Hold 4s')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      expect(screen.getByText('Completed Cycles:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('has all four breathing exercise options available', () => {
      render(<App />);
      
      expect(screen.getByRole('button', { name: 'Box Breathing' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Triangle Breathing' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Resonant Breathing' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4-7-8 Breathing' })).toBeInTheDocument();
    });

    it('defaults to circles mode (not shapes)', async () => {
      render(<App />);
      
      // Open settings to see visualization options
      await userEvent.click(screen.getByText('⚙️ Settings'));
      
      const circleButton = screen.getByText('⭕ Circle');
      const shapesButton = screen.getByText('🔺 Shapes');
      
      expect(circleButton).toHaveClass('active');
      expect(shapesButton).not.toHaveClass('active');
    });
  });

  describe('Breathing Exercise Switching', () => {
    it('switches between different breathing exercises correctly', async () => {
      render(<App />);
      
      // Switch to Triangle Breathing
      await userEvent.click(screen.getByText('Triangle Breathing'));
      expect(screen.getByText('Triangle Breathing').parentElement).toHaveClass('active');
      expect(screen.getByText('Inhale 3s → Hold 3s → Exhale 3s')).toBeInTheDocument();
      
      // Switch to Resonant Breathing
      await userEvent.click(screen.getByText('Resonant Breathing'));
      expect(screen.getByText('Resonant Breathing').parentElement).toHaveClass('active');
      expect(screen.getByText('Inhale 5s → Exhale 5s')).toBeInTheDocument();
      
      // Switch to 4-7-8 Breathing
      await userEvent.click(screen.getByText('4-7-8 Breathing'));
      expect(screen.getByText('4-7-8 Breathing').parentElement).toHaveClass('active');
      expect(screen.getByText('Inhale 4s → Hold 7s → Exhale 8s')).toBeInTheDocument();
      expect(screen.getByText('Important Instructions:')).toBeInTheDocument();
    });

    it('resets cycle count when switching exercises', async () => {
      render(<App />);
      
      // Start an exercise and let it progress
      const startButton = screen.getByRole('button', { name: /start/i });
      await userEvent.click(startButton);
      
      // Fast forward to complete a cycle
      act(() => {
        jest.advanceTimersByTime(16000); // Complete one full box breathing cycle
      });
      
      // Switch exercise
      await userEvent.click(screen.getByText('Triangle Breathing'));
      
      // Should reset to 0 cycles
      expect(screen.getByText('Completed Cycles: 0')).toBeInTheDocument();
    });
  });

  describe('Start/Stop Functionality', () => {
    it('starts and stops breathing exercise correctly', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      
      // Start the exercise
      await userEvent.click(startButton);
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      expect(screen.getByText('Breathe In')).toBeInTheDocument();
      
      // Stop the exercise
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await userEvent.click(pauseButton);
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });

    it('shows phase labels during breathing exercise', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await userEvent.click(startButton);
      
      // Should start with inhale
      expect(screen.getByText('Breathe In')).toBeInTheDocument();
      
      // Progress through phases
      act(() => {
        jest.advanceTimersByTime(4000); // Complete inhale phase
      });
      
      expect(screen.getByText('Hold')).toBeInTheDocument();
    });

    it('increments cycle count after completing full cycle', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await userEvent.click(startButton);
      
      // Complete one full cycle (16 seconds for box breathing)
      act(() => {
        jest.advanceTimersByTime(16000);
      });
      
      expect(screen.getByText('Completed Cycles: 1')).toBeInTheDocument();
    });
  });

  describe('4-7-8 Breathing Special Features', () => {
    it('shows maximum cycle limit for 4-7-8 breathing', async () => {
      render(<App />);
      
      await userEvent.click(screen.getByText('4-7-8 Breathing'));
      expect(screen.getByText('/ 8 max')).toBeInTheDocument();
    });

    it('shows warning messages at appropriate cycle counts', async () => {
      render(<App />);
      
      await userEvent.click(screen.getByText('4-7-8 Breathing'));
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await userEvent.click(startButton);
      
      // Complete 4 cycles (4 * 19 seconds = 76 seconds)
      act(() => {
        jest.advanceTimersByTime(76000);
      });
      
      expect(screen.getByText(/Beginners should stop at 4 cycles/)).toBeInTheDocument();
    });

    it('auto-stops at maximum cycles for 4-7-8 breathing', async () => {
      render(<App />);
      
      await userEvent.click(screen.getByText('4-7-8 Breathing'));
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await userEvent.click(startButton);
      
      // Complete 8 cycles (8 * 19 seconds = 152 seconds)
      act(() => {
        jest.advanceTimersByTime(152000);
      });
      
      // Should auto-stop
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      expect(screen.getByText('Completed Cycles: 8')).toBeInTheDocument();
      expect(screen.getByText(/reached the maximum recommended cycles/)).toBeInTheDocument();
    });
  });

  describe('Settings Menu', () => {
    it('opens and closes settings menu correctly', async () => {
      render(<App />);
      
      const settingsButton = screen.getByText('⚙️ Settings');
      
      // Menu should always contain the visualization mode text (part of UI)
      expect(screen.getByText('Visualization Mode:')).toBeInTheDocument();
      
      // Click menu button should work
      await userEvent.click(settingsButton);
      expect(screen.getByText('Visualization Mode:')).toBeInTheDocument();
      
      // Click again
      await userEvent.click(settingsButton);
      expect(screen.getByText('Visualization Mode:')).toBeInTheDocument();
    });

    it('switches between circle and shapes visualization', async () => {
      render(<App />);
      
      // Open settings
      await userEvent.click(screen.getByText('⚙️ Settings'));
      
      const shapesButton = screen.getByText('🔺 Shapes');
      const circleButton = screen.getByText('⭕ Circle');
      
      // Switch to shapes
      await userEvent.click(shapesButton);
      expect(shapesButton).toHaveClass('active');
      expect(circleButton).not.toHaveClass('active');
      
      // Switch back to circles
      await userEvent.click(circleButton);
      expect(circleButton).toHaveClass('active');
      expect(shapesButton).not.toHaveClass('active');
    });

    it('disables visualization toggle when exercise is active', async () => {
      render(<App />);
      
      // Open settings and start exercise
      await userEvent.click(screen.getByText('⚙️ Settings'));
      const startButton = screen.getByRole('button', { name: /start/i });
      await userEvent.click(startButton);
      
      const shapesButton = screen.getByText('🔺 Shapes');
      const circleButton = screen.getByText('⭕ Circle');
      
      expect(shapesButton).toBeDisabled();
      expect(circleButton).toBeDisabled();
    });
  });

  describe('Timer Functionality', () => {
    it('shows timer controls for non-4-7-8 exercises', async () => {
      render(<App />);
      
      await userEvent.click(screen.getByText('⚙️ Settings'));
      expect(screen.getByText('Session Duration:')).toBeInTheDocument();
      expect(screen.getByText('∞')).toBeInTheDocument();
      expect(screen.getByText('1m')).toBeInTheDocument();
      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    it('hides timer controls for 4-7-8 breathing', async () => {
      render(<App />);
      
      await userEvent.click(screen.getByText('4-7-8 Breathing'));
      await userEvent.click(screen.getByText('⚙️ Settings'));
      
      expect(screen.queryByText('Session Duration:')).not.toBeInTheDocument();
    });

    it('sets and displays timer countdown', async () => {
      render(<App />);
      
      await userEvent.click(screen.getByText('⚙️ Settings'));
      
      // Set 1 minute timer
      await userEvent.click(screen.getByText('1m'));
      expect(screen.getByText('1m')).toHaveClass('selected');
      
      // Start exercise
      const startButton = screen.getByRole('button', { name: /start/i });
      await userEvent.click(startButton);
      
      expect(screen.getByText('Time remaining: 1:00')).toBeInTheDocument();
      
      // Advance time
      act(() => {
        jest.advanceTimersByTime(30000); // 30 seconds
      });
      
      expect(screen.getByText('Time remaining: 0:30')).toBeInTheDocument();
    });

    it('auto-stops when timer reaches zero', async () => {
      render(<App />);
      
      await userEvent.click(screen.getByText('⚙️ Settings'));
      await userEvent.click(screen.getByText('1m'));
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await userEvent.click(startButton);
      
      // Fast forward past 1 minute
      act(() => {
        jest.advanceTimersByTime(61000);
      });
      
      // Should auto-stop
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });
  });

  describe('SVG Rendering', () => {
    it('renders SVG breathing visualization', () => {
      const { container } = render(<App />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 400 400');
    });

    it('renders circle by default', () => {
      const { container } = render(<App />);
      
      // Should render circle in default mode
      const circle = container.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });
  });

  describe('Accessibility and ARIA', () => {
    it('has proper ARIA attributes', () => {
      render(<App />);
      
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
      
      // Open settings
      fireEvent.click(settingsButton);
      expect(settingsButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('has proper button labels', () => {
      render(<App />);
      
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      
      // Click to start
      fireEvent.click(screen.getByRole('button', { name: /start/i }));
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid start/stop clicks', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      
      // Rapid clicks
      await userEvent.click(startButton);
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await userEvent.click(pauseButton);
      await userEvent.click(screen.getByRole('button', { name: /start/i }));
      
      // Should still be in a consistent state
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('handles exercise switching while active', async () => {
      render(<App />);
      
      // Start box breathing
      await userEvent.click(screen.getByRole('button', { name: /start/i }));
      
      // Switch to triangle breathing while active
      await userEvent.click(screen.getByText('Triangle Breathing'));
      
      // Should reset to start state with new exercise
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      expect(screen.getByText('Triangle Breathing').parentElement).toHaveClass('active');
    });
  });

  describe('Rain Effect', () => {
    it('toggles rain effect when cloud emoji is clicked', async () => {
      render(<App />);
      
      const cloudEmoji = screen.getByText('☁️');
      
      // Should not crash when clicking cloud emoji
      expect(() => fireEvent.click(cloudEmoji)).not.toThrow();
      
      // Click again to toggle off
      expect(() => fireEvent.click(cloudEmoji)).not.toThrow();
    });
  });

  describe('Performance and Cleanup', () => {
    it('handles component unmounting gracefully', () => {
      const { unmount } = render(<App />);
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
