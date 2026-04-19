# Mobile-Cloud-System

## 🚀 Live Demo

👉 https://fadydesoky.github.io/Mobile-Cloud-System/

![CI](https://github.com/Fadydesoky/Mobile-Cloud-System/actions/workflows/ci.yml/badge.svg)
![Docker](https://img.shields.io/badge/Docker-Containerization-blue)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-blueviolet)
![Python](https://img.shields.io/badge/Python-Flask-yellow)
![Redis](https://img.shields.io/badge/Redis-Distributed_System-red)
![Cloud](https://img.shields.io/badge/Cloud-Computing-green)
![Status](https://img.shields.io/badge/Project-Completed-success)

---

## Description

An end-to-end cloud-native system demonstrating modern mobile-cloud architecture using containers, orchestration, and distributed systems.

The project demonstrates how modern cloud-native applications are built using containers, orchestration, and distributed system principles.

---

## Project Summary

This project presents a complete end-to-end cloud-native system that simulates real-world mobile-cloud interaction.

It integrates a frontend client, a containerized backend API, and distributed system components, all orchestrated through modern DevOps practices.

The system demonstrates how applications are built, deployed, and managed using Docker, Kubernetes concepts, and automated CI/CD pipelines.

Overall, the project reflects a practical understanding of cloud computing, system design, and scalable architecture patterns.

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
- **Lab 2:** Distributed systems using Redis + Docker Compose
- **Lab 3:** Containerization + Kubernetes orchestration (HPA, probes, services)
- **Lab 4:** Microservices architecture with Docker Compose (service-to-service communication & resilience)

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

---

## Lab 4 — Microservices Architecture

Lab 4 extends the system by introducing a real microservices architecture using Docker Compose.

The system is split into two independent services:

- **Product Service** → provides product data  
- **Order Service** → processes orders and communicates with Product Service  

This demonstrates:

- Service-to-service communication  
- Environment-based configuration  
- Fault tolerance and retry mechanisms  
- Real-world microservices behavior  

### Architecture

Client → Order Service → Product Service

Both services run in isolated containers and communicate over the Docker internal network.

---

## Screenshots

### Docker Build
![Docker Build](Lab3/screenshots/docker-build.png)

### Docker Images
![Docker Images](Lab3/screenshots/docker-images.png)

### Kubernetes Pods
![Kubernetes Pods](Lab3/screenshots/k8s-pods.png)

### System Memory Usage (Lab 1)
![System Memory](Lab1/screenshots/system-memory.png)

### Latency Histogram
![Latency](Lab1/screenshots/latency.png)

### Redis Simulation
![Redis Simulation](Lab2/screenshots/redis-simulation.png)

### Frontend Dashboard
![Frontend](frontend/screenshots/frontend.png)

### Lab 4 — Microservices (Docker Compose)

#### Containers Running
![Containers](Lab4/screenshots/containers_running.png)

#### Product Service Health
![Product Health](Lab4/screenshots/product_health.png)

#### Product Data
![Product Data](Lab4/screenshots/product_data.png)

#### Order Creation (Success)
![Order Success](Lab4/screenshots/order_success.png)

#### Failure Simulation (Service Down)
![Failure](Lab4/screenshots/failure_simulation.png)

#### Recovery Scenario
![Recovery](Lab4/screenshots/recovery.png)

#### Service Logs (Communication)
![Logs](Lab4/screenshots/logs.png)

---

## Technologies Used

- Docker (Containerization)
- Python (Flask API)
- Kubernetes (Orchestration Concepts)
- Redis (Distributed Systems Simulation)
- React.JS (Frontend Dashboard)
  
---

## CI/CD

A production-style CI/CD pipeline is implemented using GitHub Actions.

The pipeline automatically validates and prepares the system on every push:

- Backend validation (Python syntax & linting)  
- Frontend build verification (React)  
- Docker image build validation  
- Automated frontend deployment via GitHub Pages  

This ensures the system is consistently buildable, deployable, and aligned with modern cloud-native development practices.


---

## Key Concepts Covered

- Virtualization vs Containerization  
- Cloud Infrastructure (AWS EC2 & Nitro)  
- Latency & Performance Analysis  
- Distributed Consistency (CAP Theorem)  
- Container Orchestration (Kubernetes)  
- Mobile-Cloud Integration via APIs  
- Microservices Architecture & Service Communication  
- Fault Tolerance & Resilience in Distributed Systems    

---

## Project Highlights

- Designed a cloud-based API with simulated latency  
- Demonstrated distributed system behavior using Redis  
- Built containerized applications with Docker  
- Modeled Kubernetes deployment and orchestration  
- Simulated mobile-to-cloud communication using HTTP APIs
- Designed a microservices architecture with real service-to-service communication and failure handling    

---

## System Explanation

This project demonstrates a simplified mobile-cloud architecture.

The frontend acts as a client that communicates with a backend API built using Flask.

The backend is containerized using Docker to ensure portability and consistency across environments.

Kubernetes configurations are provided to simulate orchestration features such as scaling, scheduling, and self-healing.

Redis is used to simulate distributed system behavior, particularly eventual consistency between nodes.

Overall, the system represents how modern cloud-native applications are structured and deployed.

## Notes

This project combines practical implementations with conceptual understanding of cloud-native systems.

Some components are demonstrated through simulation to reflect real-world system behavior while maintaining alignment with modern cloud architecture patterns.

Overall, the project represents a simplified end-to-end cloud-native system, covering client interaction, backend services, and orchestration in a unified workflow.

## Contact

- LinkedIn: https://www.linkedin.com/in/fadydesokysaeedabdelaziz/
