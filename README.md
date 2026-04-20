# Mobile Cloud System

### An Observability Dashboard for Cloud-Native Microservices

[![CI/CD Pipeline](https://github.com/Fadydesoky/Mobile-Cloud-System/actions/workflows/ci.yml/badge.svg)](https://github.com/Fadydesoky/Mobile-Cloud-System/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://fadydesoky.github.io/Mobile-Cloud-System/)
[![Python](https://img.shields.io/badge/python-3.9%20%7C%203.10%20%7C%203.11-blue)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/docker-containerized-2496ED)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/kubernetes-orchestration-326CE5)](https://kubernetes.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## What is This Project?

This project is a **production-grade cloud-native system** that I built to demonstrate modern software engineering practices. It simulates a real-world microservices architecture with an interactive observability dashboard, allowing you to visualize how distributed systems communicate, fail, and recover.

Whether you're a recruiter looking at my portfolio, a fellow developer exploring cloud patterns, or a student learning distributed systems - I hope this project gives you valuable insights into how modern cloud applications are built.

**[View Live Demo](https://fadydesoky.github.io/Mobile-Cloud-System/)**

---

## Why I Built This

During my Cloud & Mobile Computing course, I wanted to go beyond the typical lab assignments. Instead of just completing exercises, I built a cohesive system that ties together everything I learned:

- How containers revolutionized deployment
- Why distributed systems are tricky (hello, CAP theorem!)
- What it takes to build resilient microservices
- How observability helps us understand complex systems

The result is this project - a hands-on demonstration of concepts that power companies like Netflix, Uber, and Amazon.

---

## Key Features

| Feature | What It Does |
|---------|--------------|
| **Real-Time Simulation** | Watch microservices communicate in real-time with latency metrics |
| **Observability Dashboard** | Monitor system health, logs, and performance from a single pane |
| **Failure Simulation** | See how the system handles service outages gracefully |
| **Redis Replication** | Understand primary/replica patterns and eventual consistency |
| **CI/CD Pipeline** | Automated testing, security scanning, and deployment |
| **Dark/Light Mode** | Because developers deserve nice things |

---

## System Architecture

Here's how all the pieces fit together:

```
                              MOBILE CLIENT / BROWSER
                            (React Dashboard)
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY LAYER                                 │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          ┌─────────────────┐           ┌─────────────────┐
          │  ORDER SERVICE  │    ───►   │ PRODUCT SERVICE │
          │   (Flask API)   │           │   (Flask API)   │
          │    Port 5002    │           │    Port 5001    │
          └────────┬────────┘           └────────┬────────┘
                   │                             │
                   └──────────────┬──────────────┘
                                  ▼
          ┌───────────────────────────────────────────────┐
          │              CONTAINER LAYER                   │
          │    Docker  │  Kubernetes  │  Docker Compose   │
          └───────────────────────────────────────────────┘
                                  │
                                  ▼
          ┌───────────────────────────────────────────────┐
          │           DISTRIBUTED DATA LAYER              │
          │   ┌─────────┐       ┌─────────┐              │
          │   │ Primary │ ────► │ Replica │              │
          │   │ (Write) │       │ (Read)  │              │
          │   └─────────┘       └─────────┘              │
          │              Redis Cluster                    │
          └───────────────────────────────────────────────┘
```

---

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, JavaScript ES6+, CSS3 |
| **Backend** | Python 3.10+, Flask, Gunicorn |
| **Containers** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (Deployments, Services, HPA) |
| **Data Layer** | Redis (Primary-Replica Replication) |
| **CI/CD** | GitHub Actions |
| **Testing** | pytest, Coverage |
| **Security** | Bandit (SAST), Trivy (Container Scanning) |

---

## Getting Started

### Option 1: Just Want to See It?

Check out the **[Live Demo](https://fadydesoky.github.io/Mobile-Cloud-System/)** - no installation required!

### Option 2: Run Locally with Docker

```bash
# Clone the repository
git clone https://github.com/Fadydesoky/Mobile-Cloud-System.git
cd Mobile-Cloud-System

# Start the microservices
cd Lab4
docker compose up --build

# Access the services:
# - Product Service: http://localhost:5001
# - Order Service:   http://localhost:5002
```

### Option 3: Run the Frontend Dashboard

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

---

## Project Structure

```
Mobile-Cloud-System/
│
├── Lab1/                    # Virtualization & Cloud Fundamentals
├── Lab2/                    # Distributed Systems & Consistency
├── Lab3/                    # Container Orchestration
├── Lab4/                    # Microservices Architecture
│   ├── order-service/       # Order processing microservice
│   └── product-service/     # Product catalog microservice
│
├── frontend/                # React Observability Dashboard
│
└── .github/workflows/       # CI/CD Pipeline Configuration
```

---

## Labs Overview

This project is organized into four progressive labs, each building on the previous:

| Lab | Topic | What You'll Learn |
|-----|-------|-------------------|
| [Lab 1](Lab1/README.md) | **Virtualization & Cloud** | VMs vs Containers, Tail Latency, AWS EC2 |
| [Lab 2](Lab2/README.md) | **Distributed Systems** | Redis Replication, CAP Theorem, Consistency |
| [Lab 3](Lab3/README.md) | **Container Orchestration** | Docker Multi-stage Builds, Kubernetes, Health Probes |
| [Lab 4](Lab4/README.md) | **Microservices** | Service Communication, Fault Tolerance, Recovery |

Each lab has its own detailed README with architecture diagrams, code explanations, and hands-on exercises.

---

## API Reference

### Product Service (Port 5001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/products/<id>` | GET | Get product by ID |

### Order Service (Port 5002)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/orders` | POST | Create a new order |

### Example: Create an Order

```bash
curl -X POST http://localhost:5002/orders \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'

# Response:
# {"order_id": "ORD-ABC123", "total": 1999.98, "status": "confirmed"}
```

---

## CI/CD Pipeline

Every push triggers a comprehensive pipeline:

```
Backend Tests (Python 3.9, 3.10, 3.11)
           │
           ├── Code Quality (Linting)
           │
           ├── Security Scan (Bandit)
           │
           └── Docker Build & Trivy Scan
                      │
                      ├── Integration Tests
                      │
                      └── Deploy to GitHub Pages
```

All 9 checks must pass before merging. You can see the pipeline status in the badges at the top of this README.

---

## Screenshots

<details>
<summary><strong>Click to view screenshots</strong></summary>

### Dashboard
![Dashboard](frontend/screenshots/frontend.png)

### Docker Containers
![Containers](Lab4/screenshots/containers_running.png)

### Kubernetes Deployment
![Kubernetes](Lab3/screenshots/k8s-pods.png)

### Service Communication
![Logs](Lab4/screenshots/logs.png)

</details>

---

## What I Learned

Building this project taught me:

- **Containers aren't magic** - Understanding namespaces and cgroups demystified Docker for me
- **Distributed systems are hard** - The CAP theorem isn't just theory; you feel it when your replica returns stale data
- **Observability is crucial** - You can't fix what you can't see
- **CI/CD is a lifesaver** - Automated testing caught bugs I would have shipped to production

---

## Contributing

Contributions are welcome! Whether it's fixing a bug, improving documentation, or adding new features - I appreciate any help.

Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Let's Connect

I'm always happy to discuss cloud architecture, distributed systems, or software engineering in general!

**Fady Desoky**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/fadydesokysaeedabdelaziz/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/Fadydesoky)

---

<p align="center">
  <i>If you found this project helpful, consider giving it a star!</i>
</p>
