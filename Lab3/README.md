## How to Run

### Build Image
docker build -f Dockerfile.basic -t lab3 .

### Run Container
docker run -p 5000:5000 lab3

### Kubernetes (Simulation)
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

---

## Application Overview

A Flask-based API was implemented to simulate a cloud service.

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

---

## Namespaces and cgroups

- Namespaces isolate process visibility (PID, network, filesystem).
- Cgroups control resource allocation such as CPU and memory limits.
- Together, they form the foundation of container isolation.

---

## Scheduling

Kubernetes automatically schedules pods based on resource availability and constraints, without manual assignment.

---

## Self-Healing

When a pod fails or is deleted, Kubernetes replaces it automatically to maintain the desired state.

---

## Design Decisions

- Multi-stage Docker builds were used to optimize image size.
- A lightweight Flask API was used to simulate backend services.
- Logging was added to track requests and simulate monitoring.
- Kubernetes YAML files were structured to represent scalable deployments.

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

Docker images were configured and prepared for execution.

Kubernetes configuration files were designed to represent deployment behavior, including:
- Replication
- Service exposure
- Health monitoring via probes

---

## Critical Thinking

The system demonstrates how modern cloud-native applications are designed using:

- Declarative configuration (Kubernetes)
- Containerized services (Docker)
- Observability through logging

Even without full cluster execution, the architecture reflects real-world deployment patterns used in production systems.
