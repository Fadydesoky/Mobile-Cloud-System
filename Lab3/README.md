<p align="center">
  <img src="https://img.shields.io/badge/Lab-03-purple?style=for-the-badge&logo=docker&logoColor=white" alt="Lab 3"/>
  <img src="https://img.shields.io/badge/Topic-Orchestration-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Orchestration"/>
  <img src="https://img.shields.io/badge/Platform-Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes"/>
</p>

<h1 align="center">Container Orchestration</h1>

<p align="center">
  <i>Mastering Docker and Kubernetes for production deployments</i>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> |
  <a href="#-docker-deep-dive">Docker</a> |
  <a href="#-kubernetes">Kubernetes</a> |
  <a href="#-screenshots">Screenshots</a>
</p>

---

## Overview

This lab takes you from **containerization basics to production-grade orchestration**. You'll optimize Docker images with multi-stage builds and deploy self-healing applications on Kubernetes.

### What You'll Learn

| Concept | Description |
|---------|-------------|
| Multi-Stage Builds | Reduce image size from ~900MB to ~150MB |
| Linux Namespaces | Process isolation fundamentals |
| Kubernetes Deployments | Declarative application management |
| Health Probes | Liveness, readiness, and startup probes |
| Horizontal Pod Autoscaler | Scale based on CPU/memory metrics |

---

## Quick Start

### Docker Only

```bash
# Build optimized image
docker build -f Dockerfile.multistage -t lab3-api:optimized .

# Run container
docker run -p 5000:5000 lab3-api:optimized

# Test
curl http://localhost:5000/health
```

### With Kubernetes

```bash
# Deploy to cluster
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check status
kubectl get pods -w
```

---

## Architecture

```
+-----------------------------------------------------------------------------+
|                           KUBERNETES CLUSTER                                 |
|                                                                              |
|   +----------------------------------------------------------------------+  |
|   |                    SERVICE (LoadBalancer)                             |  |
|   |                    mobile-cloud-service                               |  |
|   |                    External Port: 80 -> Container Port: 5000          |  |
|   +----------------------------------+-----------------------------------+  |
|                                      |                                       |
|                         +------------+------------+                          |
|                         |    LOAD BALANCING       |                          |
|                         +------------+------------+                          |
|                                      |                                       |
|            +-------------------------+-------------------------+             |
|            |                         |                         |             |
|            v                         v                         v             |
|   +-----------------+     +-----------------+     +-----------------+        |
|   |     POD 1       |     |     POD 2       |     |     POD N       |        |
|   |  +-----------+  |     |  +-----------+  |     |  +-----------+  |        |
|   |  |  Flask    |  |     |  |  Flask    |  |     |  |  Flask    |  |        |
|   |  |   API     |  |     |  |   API     |  |     |  |   API     |  |        |
|   |  | Port:5000 |  |     |  | Port:5000 |  |     |  | Port:5000 |  |        |
|   |  +-----------+  |     |  +-----------+  |     |  +-----------+  |        |
|   |                 |     |                 |     |                 |        |
|   |  Liveness:  OK  |     |  Liveness:  OK  |     |  Liveness:  OK  |        |
|   |  Readiness: OK  |     |  Readiness: OK  |     |  Readiness: OK  |        |
|   +-----------------+     +-----------------+     +-----------------+        |
|                                                                              |
|   +----------------------------------------------------------------------+  |
|   |              HORIZONTAL POD AUTOSCALER (HPA)                          |  |
|   |              Min Replicas: 2  |  Max: 10  |  Target CPU: 50%          |  |
|   +----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
```

---

## Docker Deep Dive

### Multi-Stage Builds

Multi-stage builds dramatically reduce image size by separating build and runtime environments:

```dockerfile
# ============== BUILD STAGE ==============
FROM python:3.10-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt
# Image size here: ~400MB (includes pip, build tools)

# ============ PRODUCTION STAGE ============
FROM python:3.10-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 5000
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
# Final image: ~150MB (runtime only)
```

### Size Comparison

| Build Type | Image Size | Contents |
|------------|------------|----------|
| Basic (FROM python:3.10) | ~900MB | Full Python + OS + build tools |
| Slim (FROM python:3.10-slim) | ~400MB | Minimal Python + OS |
| Multi-stage | ~150MB | Only runtime dependencies |

```bash
# Compare yourself
docker build -f Dockerfile.basic -t lab3:basic .
docker build -f Dockerfile.multistage -t lab3:optimized .
docker images | grep lab3
```

---

### Linux Container Fundamentals

Containers use **namespaces** for isolation and **cgroups** for resource limits:

#### Namespaces (Isolation)

```
+------------------+     +------------------+     +------------------+
|   Container A    |     |   Container B    |     |   Container C    |
+------------------+     +------------------+     +------------------+
| PID: 1, 2, 3     |     | PID: 1, 2        |     | PID: 1           |
| NET: eth0        |     | NET: eth0        |     | NET: eth0        |
| MNT: /app        |     | MNT: /app        |     | MNT: /app        |
| USER: root       |     | USER: appuser    |     | USER: root       |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                        +------------------+
                        |   HOST KERNEL    |
                        |   (Shared)       |
                        +------------------+
```

| Namespace | Isolates |
|-----------|----------|
| **PID** | Process IDs - Container sees only its processes |
| **NET** | Network - Each container has its own network stack |
| **MNT** | Filesystem - Separate mount points |
| **UTS** | Hostname - Container can have its own hostname |
| **IPC** | Inter-process communication |
| **USER** | User/group IDs |

#### Control Groups (Resource Limits)

```
+----------------------------------------------------------------+
|                      CONTROL GROUPS                             |
|                                                                 |
|   Container A              Container B              Container C |
|   +-----------+            +-----------+            +---------+ |
|   | CPU: 500m |            | CPU: 1000m|            | CPU:250m| |
|   | MEM: 256Mi|            | MEM: 512Mi|            | MEM:128M| |
|   +-----------+            +-----------+            +---------+ |
|                                                                 |
|   Total Host Resources: 4 CPU, 8GB RAM                         |
|   Prevents any container from consuming all resources           |
+----------------------------------------------------------------+
```

---

## Kubernetes

### Deployment Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mobile-cloud-api
spec:
  replicas: 3                    # Desired number of pods
  selector:
    matchLabels:
      app: mobile-cloud-api
  template:
    metadata:
      labels:
        app: mobile-cloud-api
    spec:
      containers:
      - name: api
        image: mobile-cloud-api:latest
        ports:
        - containerPort: 5000
        resources:
          requests:              # Minimum guaranteed
            memory: "128Mi"
            cpu: "250m"
          limits:                # Maximum allowed
            memory: "256Mi"
            cpu: "500m"
```

### Health Probes

Kubernetes uses probes to manage container lifecycle:

| Probe | Question | Failure Action |
|-------|----------|----------------|
| **Liveness** | Is the container alive? | Restart container |
| **Readiness** | Can it receive traffic? | Remove from service endpoints |
| **Startup** | Has it finished starting? | Delay other probes |

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 10    # Wait before first check
  periodSeconds: 5           # Check every 5 seconds
  failureThreshold: 3        # Restart after 3 failures

readinessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 5
  periodSeconds: 3
```

### Self-Healing Loop

```
+----------------------------------------------------------------+
|                   KUBERNETES CONTROL LOOP                       |
|                                                                 |
|   DESIRED STATE              ACTUAL STATE             ACTION    |
|   ============              ============             ========   |
|   replicas: 3       vs      pods: 2           -->   Create 1   |
|   replicas: 3       vs      pods: 4           -->   Delete 1   |
|   image: v2         vs      image: v1         -->   Rolling    |
|                                                      Update     |
|   liveness: pass    vs      liveness: fail    -->   Restart    |
|                                                      Container  |
+----------------------------------------------------------------+
```

---

## Screenshots

### Docker Build Process
![Docker Build](screenshots/docker-build.png)

### Docker Images (Size Comparison)
![Docker Images](screenshots/docker-images.png)

### Kubernetes Pods Running
![Kubernetes Pods](screenshots/k8s-pods.png)

### API Testing with Postman
![Postman Request](screenshots/postman-mobile-api.png)

### Architecture Diagram
![Architecture Diagram](screenshots/architecture-diagram.png)

---

## API Reference

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/` | GET | Root with latency simulation | `{"message": "Mobile Cloud API", "delay": 0.5}` |
| `/data?size=N` | GET | Generate N data items | `{"data": [...], "count": N}` |
| `/health` | GET | Health check (used by K8s probes) | `{"status": "healthy"}` |

---

## Useful Commands

### Docker

```bash
# Build and tag
docker build -t lab3-api:v1 .

# Run with resource limits
docker run -d --memory=256m --cpus=0.5 -p 5000:5000 lab3-api:v1

# View container stats
docker stats

# Inspect container
docker inspect <container_id>
```

### Kubernetes

```bash
# Apply configurations
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml

# Monitor
kubectl get pods -w
kubectl get hpa
kubectl top pods

# Debugging
kubectl logs -l app=mobile-cloud-api
kubectl describe pod <pod-name>
kubectl exec -it <pod-name> -- /bin/sh

# Scaling
kubectl scale deployment mobile-cloud-api --replicas=5
```

---

## Mobile Client Integration

### Android (Kotlin + Retrofit)

```kotlin
interface MobileCloudApi {
    @GET("/")
    suspend fun getStatus(): Response<StatusResponse>
    
    @GET("/data")
    suspend fun getData(@Query("size") size: Int): Response<DataResponse>
    
    @GET("/health")
    suspend fun healthCheck(): Response<HealthResponse>
}
```

### iOS (Swift + URLSession)

```swift
func fetchData(size: Int) async throws -> DataResponse {
    let url = URL(string: "http://api.example.com/data?size=\(size)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(DataResponse.self, from: data)
}
```

---

## Key Takeaways

1. **Multi-stage builds** reduce image size by 80%+ and minimize attack surface
2. **Namespaces and cgroups** provide container isolation and resource control
3. **Health probes** enable Kubernetes to maintain application health automatically
4. **Declarative configuration** allows Kubernetes to self-heal and maintain desired state
5. **Horizontal Pod Autoscaler** adjusts capacity based on actual demand

---

## Further Reading

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Configure Liveness and Readiness Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Horizontal Pod Autoscaling](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)

---

<p align="center">
  <a href="../Lab2/README.md">Previous: Lab 2 - Distributed Systems</a> |
  <a href="../README.md">Back to Main README</a> |
  <a href="../Lab4/README.md">Next: Lab 4 - Microservices</a>
</p>
