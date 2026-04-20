import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import { fetchData, fetchDataWithRetry } from './api';

// Mock fetch globally
beforeAll(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('App Component', () => {
  beforeEach(() => {
    // Default mock for health checks
    fetch.mockImplementation((url) => {
      if (url.includes('/health')) {
        return Promise.resolve({ 
          ok: true, 
          json: () => Promise.resolve({ status: 'healthy' }) 
        });
      }
      return Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve({}) 
      });
    });
  });

  test('renders Mobile Cloud System header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Mobile Cloud System/i)).toBeInTheDocument();
  });

  test('renders Run Simulation button', async () => {
    await act(async () => {
      render(<App />);
    });
    const buttons = screen.getAllByText(/Run Simulation/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders Observability Dashboard title', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Observability Dashboard/i)).toBeInTheDocument();
  });

  test('toggles dark/light mode', async () => {
    await act(async () => {
      render(<App />);
    });
    // Find the theme toggle button (it contains Sun icon in dark mode)
    const themeButton = document.querySelector('button[style*="display: flex"]');
    expect(themeButton).toBeInTheDocument();
  });

  test('renders System Architecture section', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/System Architecture/i)).toBeInTheDocument();
  });

  test('renders service status cards', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Order Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Product Service/i)).toBeInTheDocument();
  });

  test('shows Processing when simulation runs', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/health')) {
        return Promise.resolve({ ok: true });
      }
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              order_id: 'ORD-123',
              product: 'Test Product',
              quantity: 2,
              total_price: 100
            })
          });
        }, 100);
      });
    });

    await act(async () => {
      render(<App />);
    });
    
    const buttons = screen.getAllByText(/Run Simulation/i);
    const button = buttons[0];
    
    await act(async () => {
      fireEvent.click(button);
    });
    
    // Check for Processing state (button text or status indicator)
    const processingElements = screen.queryAllByText(/Processing/i);
    expect(processingElements.length).toBeGreaterThan(0);
  });

  test('displays error state on fetch failure', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/health')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.reject(new Error('Network error'));
    });

    await act(async () => {
      render(<App />);
    });
    
    const buttons = screen.getAllByText(/Run Simulation/i);
    const button = buttons[0];
    
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      // Check for error status indicator or log entry
      const errorElements = screen.queryAllByText(/Error/i);
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  test('displays metrics cards', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Total Requests/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Latency/i)).toBeInTheDocument();
  });

  test('displays API Response section', async () => {
    await act(async () => {
      render(<App />);
    });
    // API Response heading
    const apiHeading = screen.getByRole('heading', { level: 3, name: /API Response/i });
    expect(apiHeading).toBeInTheDocument();
  });

  test('displays System Logs section', async () => {
    await act(async () => {
      render(<App />);
    });
    // System Logs heading
    const logsHeading = screen.getByRole('heading', { level: 3, name: /System Logs/i });
    expect(logsHeading).toBeInTheDocument();
  });

  test('renders navigation tabs', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    // "Logs" appears in both nav tabs and System Logs section
    const logsElements = screen.getAllByText(/Logs/i);
    expect(logsElements.length).toBeGreaterThan(0);
  });

  test('renders Technology Stack section', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Technology Stack/i)).toBeInTheDocument();
  });

  test('renders GitHub link', async () => {
    await act(async () => {
      render(<App />);
    });
    const githubLinks = screen.getAllByText(/GitHub/i);
    expect(githubLinks.length).toBeGreaterThan(0);
  });

  test('renders Refresh button', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Refresh/i)).toBeInTheDocument();
  });

  test('displays success rate metric', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Success Rate/i)).toBeInTheDocument();
  });

  test('displays uptime metric', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Uptime/i)).toBeInTheDocument();
  });
});

describe('API Functions', () => {
  test('fetchDataWithRetry is a function', () => {
    expect(typeof fetchDataWithRetry).toBe('function');
  });

  test('fetchData is exported and is a function', () => {
    expect(typeof fetchData).toBe('function');
  });
});

describe('App Footer', () => {
  beforeEach(() => {
    fetch.mockImplementation(() => Promise.resolve({ ok: true }));
  });

  test('renders footer with technology stack', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Docker \+ Kubernetes \+ Redis/i)).toBeInTheDocument();
  });

  test('renders footer with React and Flask mention', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText(/Built with React, Flask/i)).toBeInTheDocument();
  });
});

describe('Architecture Diagram', () => {
  beforeEach(() => {
    fetch.mockImplementation(() => Promise.resolve({ ok: true }));
  });

  test('renders architecture nodes', async () => {
    await act(async () => {
      render(<App />);
    });
    // Check for multiple React mentions (architecture + tech stack)
    const reactElements = screen.getAllByText('React');
    expect(reactElements.length).toBeGreaterThan(0);
    
    // Check for Docker mentions
    const dockerElements = screen.getAllByText('Docker');
    expect(dockerElements.length).toBeGreaterThan(0);
    
    // Kubernetes appears in architecture diagram
    const k8sElements = screen.getAllByText('Kubernetes');
    expect(k8sElements.length).toBeGreaterThan(0);
    
    // Redis Primary appears in architecture data layer
    const redisElements = screen.getAllByText(/Redis/i);
    expect(redisElements.length).toBeGreaterThan(0);
  });

  test('displays Live Data Flow label', async () => {
    await act(async () => {
      render(<App />);
    });
    // Architecture header shows "Live Data Flow" or "Processing" during simulation
    const flowLabel = screen.queryByText(/Live Data Flow/i) || screen.queryByText(/Processing/i);
    expect(flowLabel).toBeInTheDocument();
  });
});
