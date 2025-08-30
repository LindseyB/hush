// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock for IntersectionObserver API
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords = jest.fn(() => []);

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
  }
}

global.IntersectionObserver = MockIntersectionObserver as any;

// Mock for Audio API
class MockAudio {
  play = jest.fn(() => Promise.resolve());
  pause = jest.fn();
  load = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  currentTime = 0;
  volume = 1;
  loop = false;
  muted = false;

  constructor(src?: string) {
    // Optional constructor parameter
  }
}

global.Audio = MockAudio as any;

// Mock for process.env.PUBLIC_URL
process.env.PUBLIC_URL = '';

// Mock for window.location.pathname
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/'
  },
  writable: true
});
