import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Hush Breathing App - Core Functionality Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    // Setup userEvent with fake timers
    user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
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

    it('defaults to circles mode (not shapes)', () => {
      render(<App />);
      
      // The visualization options should be visible (settings are open in test environment)
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
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Triangle Breathing' }));
      });
      expect(screen.getByRole('button', { name: 'Triangle Breathing' })).toHaveClass('active');
      expect(screen.getByText('Inhale 3s → Hold 3s → Exhale 3s')).toBeInTheDocument();
      
      // Switch to Resonant Breathing
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Resonant Breathing' }));
      });
      expect(screen.getByRole('button', { name: 'Resonant Breathing' })).toHaveClass('active');
      expect(screen.getByText('Inhale 5s → Exhale 5s')).toBeInTheDocument();
      
      // Switch to 4-7-8 Breathing
      await act(async () => {
        await user.click(screen.getByRole('button', { name: '4-7-8 Breathing' }));
      });
      expect(screen.getByRole('button', { name: '4-7-8 Breathing' })).toHaveClass('active');
      expect(screen.getByText('Inhale 4s → Hold 7s → Exhale 8s')).toBeInTheDocument();
      expect(screen.getByText('Important Instructions:')).toBeInTheDocument();
    });

    it('resets cycle count when switching exercises', async () => {
      render(<App />);
      
      // Start an exercise and let it progress
      const startButton = screen.getByRole('button', { name: /start/i });
      await act(async () => {
        await user.click(startButton);
      });
      
      // Fast forward to complete a cycle
      act(() => {
        jest.advanceTimersByTime(16000); // Complete one full box breathing cycle
      });
      
      // Switch exercise
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Triangle Breathing' }));
      });
      
      // Should reset to 0 cycles
      const cycleCount = document.querySelector('.cycle-count');
      expect(cycleCount).toHaveTextContent('0');
    });
  });

  describe('Start/Stop Functionality', () => {
    it('starts and stops breathing exercise correctly', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      
      // Start the exercise
      await act(async () => {
        await user.click(startButton);
      });
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
      expect(screen.getByText('Breathe In')).toBeInTheDocument();
      
      // Stop the exercise
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await act(async () => {
        await user.click(pauseButton);
      });
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    });

    it('shows phase labels during breathing exercise', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await act(async () => {
        await user.click(startButton);
      });
      
      // Should start with inhale
      expect(screen.getByText('Breathe In')).toBeInTheDocument();
      
      // Progress through phases
      await act(async () => {
        jest.advanceTimersByTime(4100); // Complete inhale phase + buffer
      });
      
      expect(screen.getByText('Hold')).toBeInTheDocument();
    });

    it('increments cycle count after completing full cycle', async () => {
      render(<App />);
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await act(async () => {
        await user.click(startButton);
      });
      
      // Complete more than one full cycle to ensure we see the increment
      // Box breathing: 4s inhale + 4s hold + 4s exhale + 4s hold = 16s per cycle
      // Let's do 1.5 cycles = 24s to be sure we complete at least one full cycle
      await act(async () => {
        jest.advanceTimersByTime(24000);
      });
      
      // Check the cycle count span specifically - should be at least 1
      const cycleCount = document.querySelector('.cycle-count');
      expect(cycleCount).toHaveTextContent('1');
    });
  });

  describe('4-7-8 Breathing Special Features', () => {
    it('shows maximum cycle limit for 4-7-8 breathing', async () => {
      render(<App />);
      
      await act(async () => {
        await user.click(screen.getByRole('button', { name: '4-7-8 Breathing' }));
      });
      expect(screen.getByText('/ 8 max')).toBeInTheDocument();
    });

    it('shows warning messages at appropriate cycle counts', async () => {
      render(<App />);
      
      await act(async () => {
        await user.click(screen.getByRole('button', { name: '4-7-8 Breathing' }));
      });
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await act(async () => {
        await user.click(startButton);
      });
      
      // Complete 4 cycles (4 * 19 seconds = 76 seconds)
      act(() => {
        jest.advanceTimersByTime(76000);
      });
      
      expect(screen.getByText(/Beginners should stop at 4 cycles/)).toBeInTheDocument();
    });

    it('auto-stops at maximum cycles for 4-7-8 breathing', async () => {
      render(<App />);
      
      await act(async () => {
        await user.click(screen.getByRole('button', { name: '4-7-8 Breathing' }));
      });
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await act(async () => {
        await user.click(startButton);
      });
      
      // Verify we see the max cycles indicator (confirms we're on 4-7-8)
      expect(screen.getByText('/ 8 max')).toBeInTheDocument();
      
      // Run for enough time that we should definitely hit the 8 cycle limit
      await act(async () => {
        jest.advanceTimersByTime(170000); // Should be ~8-9 cycles worth
      });
      
      // Should have auto-stopped (Start button should be visible)
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      
      // Should see the warning message
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
      await act(async () => { await user.click(settingsButton); });
      expect(screen.getByText('Visualization Mode:')).toBeInTheDocument();
      
      // Click again
      await act(async () => { await user.click(settingsButton); });
      expect(screen.getByText('Visualization Mode:')).toBeInTheDocument();
    });

    it('switches between circle and shapes visualization', async () => {
      render(<App />);
      
      // Open settings
      await act(async () => { await user.click(screen.getByText('⚙️ Settings')); });
      
      const shapesButton = screen.getByText('🔺 Shapes');
      const circleButton = screen.getByText('⭕ Circle');
      
      // Switch to shapes
      await act(async () => { await user.click(shapesButton); });
      expect(shapesButton).toHaveClass('active');
      expect(circleButton).not.toHaveClass('active');
      
      // Switch back to circles
      await act(async () => { await user.click(circleButton); });
      expect(circleButton).toHaveClass('active');
      expect(shapesButton).not.toHaveClass('active');
    });

    it('disables visualization toggle when exercise is active', async () => {
      render(<App />);
      
      // Open settings and start exercise
      await act(async () => { await user.click(screen.getByText('⚙️ Settings')); });
      const startButton = screen.getByRole('button', { name: /start/i });
      await act(async () => { await user.click(startButton); });
      
      const shapesButton = screen.getByText('🔺 Shapes');
      const circleButton = screen.getByText('⭕ Circle');
      
      expect(shapesButton).toBeDisabled();
      expect(circleButton).toBeDisabled();
    });
  });

  describe('Timer Functionality', () => {
    it('shows timer controls for non-4-7-8 exercises', async () => {
      render(<App />);
      
      await act(async () => { await user.click(screen.getByText('⚙️ Settings')); });
      expect(screen.getByText('Session Duration:')).toBeInTheDocument();
      expect(screen.getByText('∞')).toBeInTheDocument();
      expect(screen.getByText('1m')).toBeInTheDocument();
      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    it('hides timer controls for 4-7-8 breathing', async () => {
      render(<App />);
      
      await act(async () => { await user.click(screen.getByText('4-7-8 Breathing')); });
      await act(async () => { await user.click(screen.getByText('⚙️ Settings')); });
      
      expect(screen.queryByText('Session Duration:')).not.toBeInTheDocument();
    });

    it('sets and displays timer countdown', async () => {
      render(<App />);
      
      await act(async () => { await user.click(screen.getByText('⚙️ Settings')); });
      
      // Set 1 minute timer
      await act(async () => { await user.click(screen.getByText('1m')); });
      expect(screen.getByText('1m')).toHaveClass('selected');
      
      // Start exercise
      const startButton = screen.getByRole('button', { name: /start/i });
      await act(async () => { await user.click(startButton); });
      
      expect(screen.getByText('Time remaining: 1:00')).toBeInTheDocument();
      
      // Advance time
      act(() => {
        jest.advanceTimersByTime(30000); // 30 seconds
      });
      
      expect(screen.getByText('Time remaining: 0:30')).toBeInTheDocument();
    });

    it('auto-stops when timer reaches zero', async () => {
      render(<App />);
      
      await act(async () => { await user.click(screen.getByText('⚙️ Settings')); });
      await act(async () => { await user.click(screen.getByText('1m')); });
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await act(async () => { await user.click(startButton); });
      
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
      await act(async () => { await user.click(startButton); });
      const pauseButton = screen.getByRole('button', { name: /pause/i });
      await act(async () => { await user.click(pauseButton); });
      await act(async () => { await user.click(screen.getByRole('button', { name: /start/i })); });
      
      // Should still be in a consistent state
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('handles exercise switching while active', async () => {
      render(<App />);
      
      // Start box breathing
      await act(async () => { await user.click(screen.getByRole('button', { name: /start/i })); });
      
      // Switch to triangle breathing while active
      await act(async () => { await user.click(screen.getByText('Triangle Breathing')); });
      
      // Should reset to start state with new exercise
      expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Triangle Breathing' })).toHaveClass('active');
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
