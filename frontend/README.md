# Frontend: Mobile Cloud Dashboard

A React-based dashboard application that serves as the client interface for the Mobile Cloud System, demonstrating client-server communication patterns in cloud-native applications.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://fadydesoky.github.io/Mobile-Cloud-System/)

---

## Overview

The frontend simulates a mobile client interacting with cloud backend services through HTTP APIs. It provides a visual interface for testing API endpoints, monitoring response times, and demonstrating the mobile-to-cloud communication flow.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      REACT DASHBOARD                             │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    UI Components                           │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │  │
│  │  │  Response   │ │    Data     │ │   Health    │          │  │
│  │  │   Timer     │ │  Display    │ │   Status    │          │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    API Service Layer                       │  │
│  │           (Axios / Fetch HTTP Client)                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND API SERVICES                         │
│                    (Flask / Microservices)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Response Time Display** | Shows API latency metrics in real-time |
| **Data Retrieval** | Fetches and displays data from backend services |
| **Health Monitoring** | Displays service health status |
| **Error Handling** | Graceful error display for failed requests |

---

## Screenshot

![Frontend Dashboard](screenshots/frontend.png)

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| JavaScript ES6+ | Programming language |
| CSS3 | Styling |
| Fetch API | HTTP client |

---

## How to Run

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

### Production Build

```bash
# Create optimized production build
npm run build

# Serve the build
npx serve -s build
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

---

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   └── favicon.ico
│
├── src/
│   ├── App.js              # Main application component
│   ├── App.css             # Application styles
│   ├── api.js              # API service layer
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
│
├── screenshots/
│   └── frontend.png        # Dashboard screenshot
│
├── package.json            # Dependencies and scripts
└── README.md
```

---

## API Integration

The frontend communicates with backend services through a centralized API layer:

```javascript
// Example API calls
const api = {
  // Get response time
  getStatus: () => fetch('/api/'),
  
  // Get data with size parameter
  getData: (size) => fetch(`/api/data?size=${size}`),
  
  // Health check
  getHealth: () => fetch('/api/health')
};
```

---

## Environment Configuration

For local development with the backend:

```bash
# Create .env.local file
REACT_APP_API_URL=http://localhost:5000
```

For production deployment:
```bash
REACT_APP_API_URL=https://api.your-domain.com
```

---

## Deployment

The frontend is automatically deployed to GitHub Pages via CI/CD pipeline:

1. Push to `main` branch triggers build
2. React app is built with `npm run build`
3. Build artifacts deployed to `gh-pages` branch
4. Live at: https://fadydesoky.github.io/Mobile-Cloud-System/

---

## Key Takeaways

1. **Separation of concerns**: UI is decoupled from backend logic
2. **API abstraction**: Centralized API layer simplifies backend communication
3. **Error boundaries**: Graceful handling of API failures
4. **Responsive design**: Works across different screen sizes

---

## Further Reading

- [React Documentation](https://react.dev/)
- [Create React App](https://create-react-app.dev/)
- [Deploying to GitHub Pages](https://create-react-app.dev/docs/deployment/#github-pages)
