# Mobile-Cloud-System

![Docker](https://img.shields.io/badge/Docker-Containerization-blue)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-blueviolet)
![Python](https://img.shields.io/badge/Python-Flask-yellow)
![Redis](https://img.shields.io/badge/Redis-Distributed_System-red)
![Cloud](https://img.shields.io/badge/Cloud-Computing-green)
![Status](https://img.shields.io/badge/Project-Completed-success)

---

This repository presents a complete hands-on exploration of Mobile and Cloud Computing concepts, combining practical implementations with system-level analysis.

The project demonstrates how modern cloud-native applications are built using containers, orchestration, and distributed system principles.

---

## System Architecture

The following diagram illustrates the overall architecture of the project, connecting mobile clients, cloud services, and distributed systems:

![Architecture Diagram](Lab3/screenshots/architecture-diagram.png)

This architecture represents a simplified cloud-native system combining client interaction, backend services, and distributed components.

The frontend acts as a client interface, while the Flask API handles request processing.

Containerization ensures portability, and Kubernetes manages deployment and scaling.

Redis is used to simulate distributed system behavior.

This represents a complete mobile-cloud workflow:
- Mobile client sends requests  
- Flask API processes data  
- Kubernetes manages deployment  
- Redis (optional) simulates distributed storage

End-to-end flow: Frontend → Flask API → Container → Kubernetes → Redis

---


## Labs Overview

- **Lab 1:** Virtualization and Cloud Basics (Latency & AWS)
- **Lab 2:** Distributed Systems (Redis & Consistency Simulation)
- **Lab 3:** Containerization and Kubernetes Orchestration

## API Endpoints

- GET `/` → Returns response time with simulated delay  
- GET `/data?size=100` → Returns generated dataset  
- GET `/health` → Returns service status
  
---

## Quick Start

The system can be executed locally using Docker and Node.js as shown below.

### 1. Run Backend (Lab 3)
cd Lab3
docker build -f Dockerfile.basic -t lab3 .
docker run -p 5000:5000 lab3

### 2. Run Frontend
cd frontend
npm install
npm start

### 3. Access the System
Frontend: http://localhost:3000  
API: http://localhost:5000

## API Example

Sample response from the backend:

```json
{
  "message": "Mobile Cloud API",
  "delay": 0.73
}
```

## Screenshots

### Docker Build
![Docker Build](Lab3/screenshots/docker-build.png)

### Docker Images
![Docker Images](Lab3/screenshots/docker-images.png)

### Kubernetes Pods
![Kubernetes Pods](Lab3/screenshots/k8s-pods.png)

### Redis Simulation
![Redis Simulation](Lab2/screenshots/redis-simulation.png)

### Latency Histogram
![Latency](Lab1/screenshots/latency.png)

### Frontend Dashboard
![Frontend](frontend/screenshots/frontend.png)

---

## Technologies Used

- Docker (Containerization)
- Python (Flask API)
- Kubernetes (Orchestration Concepts)
- Redis (Distributed Systems Simulation)
- React.JS (Frontend Dashboard)
  
---

## Key Concepts Covered

- Virtualization vs Containerization  
- Cloud Infrastructure (AWS EC2 & Nitro)  
- Latency & Performance Analysis  
- Distributed Consistency (CAP Theorem)  
- Container Orchestration (Kubernetes)  
- Mobile-Cloud Integration via APIs  

---

## Project Highlights

- Designed a cloud-based API with simulated latency  
- Demonstrated distributed system behavior using Redis  
- Built containerized applications with Docker  
- Modeled Kubernetes deployment and orchestration  
- Simulated mobile-to-cloud communication using HTTP APIs  

---

## Notes

This project combines practical implementations with conceptual understanding of cloud-native systems.

Some components are demonstrated through simulation to reflect real-world system behavior while maintaining alignment with modern cloud architecture patterns.

Overall, the project represents a simplified end-to-end cloud-native system, covering client interaction, backend services, and orchestration in a unified workflow.
