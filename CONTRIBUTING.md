# Contributing Guide

## Project Structure

```
Mobile-Cloud-System/
├── Lab1/                    # Virtualization & Cloud Basics
├── Lab2/                    # Redis Distributed Systems
│   ├── app.py              # Flask API with Redis
│   ├── requirements.txt
│   └── tests/              # Unit tests
├── Lab3/                    # Containerization & K8s
│   ├── app.py              # Mobile Cloud API
│   ├── Dockerfile.basic
│   ├── Dockerfile.multistage
│   ├── k8s/                # Kubernetes manifests
│   ├── requirements.txt
│   └── tests/              # Unit tests
├── Lab4/                    # Microservices Architecture
│   ├── docker-compose.yml
│   ├── order-service/
│   ├── product-service/
│   └── tests/              # Integration tests
├── frontend/                # React Dashboard
└── .github/workflows/       # CI/CD Pipeline
```

## Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose

### Backend Setup
```bash
# Install dependencies for a specific lab
cd Lab3
pip install -r requirements.txt

# Run tests
pytest tests/ -v --cov=.

# Start the service
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Docker Development
```bash
# Build and run Lab3
docker build -f Lab3/Dockerfile.multistage -t lab3 .
docker run -p 5000:5000 lab3

# Run Lab4 microservices
cd Lab4
docker compose up --build
```

## Code Quality

### Linting
```bash
# Python
flake8 Lab2 Lab3 Lab4
black --check Lab2 Lab3 Lab4

# Frontend
cd frontend && npm run lint
```

### Testing
```bash
# Run all tests
pytest

# With coverage report
pytest --cov=. --cov-report=html
```

## API Standards

All services follow these conventions:

### Health Endpoints
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe
- `GET /metrics` - Prometheus metrics

### Response Format
```json
{
  "status": "success|error",
  "data": {},
  "message": "Human-readable message"
}
```

## Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `ci:` CI/CD changes

## Pull Request Process

1. Create a feature branch
2. Make changes and add tests
3. Ensure CI passes
4. Request review
