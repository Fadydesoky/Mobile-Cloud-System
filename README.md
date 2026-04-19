# Mobile-Cloud-Labs

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

## Labs Overview

- **Lab 1:** Virtualization and Cloud Basics (Latency & AWS)
- **Lab 2:** Distributed Systems (Redis & Consistency Simulation)
- **Lab 3:** Containerization and Kubernetes Orchestration

---

## System Architecture

The following diagram illustrates the overall architecture of the project, connecting mobile clients, cloud services, and distributed systems:

![Architecture Diagram](Lab3/screenshots/architecture-diagram.png)

This represents a complete mobile-cloud workflow:
- Mobile client sends requests  
- Flask API processes data  
- Kubernetes manages deployment  
- Redis (optional) simulates distributed storage  

---

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

---

## Technologies Used

- Docker (Containerization)
- Python (Flask API)
- Kubernetes (Orchestration Concepts)
- Redis (Distributed Systems Simulation)

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

This project focuses on combining practical configurations with conceptual understanding.

Some components are demonstrated through simulation to reflect real-world system behavior while maintaining consistency with cloud-native architecture patterns.
