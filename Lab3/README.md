# Lab 3 - Containerization and Cloud Orchestration

## How to Run

### Build Image (Basic)
docker build -f Dockerfile.basic -t lab3 .

### Build Image (Multi-stage)
docker build -f Dockerfile.multistage -t lab3:ms .

### Run Container
docker run -p 5000:5000 lab3

### Access
http://localhost:5000

### Kubernetes (Simulation)
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

---

## Application Overview

A Flask-based API was implemented to simulate a cloud service.

The API introduces random delays to simulate real-world latency in cloud environments.

Endpoints:
- `/` → returns response time with simulated delay  
- `/data` → returns generated dataset  
- `/health` → health check endpoint  

Logging is used to monitor requests and simulate observability in cloud systems.

---

## Observations

- Multi-stage Docker builds significantly reduce image size.
- Containers provide faster startup compared to traditional VMs.
- Kubernetes ensures high availability through replica management.
- Kubernetes follows a declarative model where the system maintains the desired state.
- Logging provides visibility into request behavior, which is essential for monitoring distributed systems.

---

## Design Decisions

- Multi-stage Docker builds were used to optimize image size.
- A lightweight Flask API was used to simulate backend services.
- Logging was added to track requests and simulate monitoring.
- Kubernetes YAML files were structured to represent scalable deployments.

---

## Namespaces and cgroups

- Namespaces isolate process visibility (PID, network, filesystem).
- Cgroups control resource allocation such as CPU and memory limits.
- Together, they enable lightweight and efficient containerization compared to traditional virtualization.

---

## Scheduling

Kubernetes automatically schedules pods based on resource availability and constraints.

This is done using a scheduler that considers available resources and system conditions.

---

## Self-Healing

When a pod fails or is deleted, Kubernetes replaces it automatically to maintain the desired state.

---

## Reflection

### Why namespaces alone are not enough?
They isolate processes but do not enforce resource limits.

### How do cgroups help?
They ensure fair resource usage and prevent resource exhaustion.

### What is desired state?
Kubernetes continuously reconciles the actual system state with the defined configuration.

### Difference between readiness and liveness?
Readiness determines if the service can receive traffic, while liveness checks if it is still running.

---

## Practical Execution

Docker images were defined and configured for building and execution.

Kubernetes configuration files were designed to represent deployment behavior, including:
- Replication
- Service exposure
- Health monitoring via probes

---

## Screenshots

### Docker Build
![Docker Build](screenshots/docker-build.png)

### Docker Images
![Docker Images](screenshots/docker-images.png)

### Kubernetes Pods
![Kubernetes Pods](screenshots/k8s-pods.png)

---

## Mobile Integration

The Flask API can be accessed from a mobile device using HTTP requests.

Example clients:
- Android (Retrofit)
- iOS (URLSession)

### API Request Example (Postman)

![Postman Request](screenshots/postman-mobile-api.png)

The request returns JSON data, which can be consumed directly by mobile applications.

This demonstrates a typical client-server interaction in mobile-cloud architectures.

---

## Critical Thinking

The system demonstrates how modern cloud-native applications are designed using:

- Declarative configuration (Kubernetes)
- Containerized services (Docker)
- Observability through logging

This approach separates application logic from infrastructure, improving scalability and maintainability.

Even without full cluster execution, the architecture reflects real-world deployment patterns used in production systems.
