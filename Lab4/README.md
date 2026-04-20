# Lab 4: Microservices Architecture

This lab implements a production-grade microservices system demonstrating service-to-service communication, fault tolerance, and recovery patterns using Docker Compose.

---

## Objectives

- Design and implement independent microservices
- Establish inter-service communication patterns
- Implement fault tolerance and graceful degradation
- Demonstrate service recovery mechanisms

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                        (curl / Postman / Frontend)                           │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────────┐
│        ORDER SERVICE            │   │         PRODUCT SERVICE              │
│         (Port 5002)             │   │          (Port 5001)                 │
│                                 │   │                                      │
│  ┌───────────────────────────┐  │   │  ┌────────────────────────────────┐ │
│  │    POST /orders           │  │   │  │    GET /products/<id>          │ │
│  │                           │  │   │  │                                │ │
│  │  1. Validate request      │──┼───┼─►│  1. Lookup product            │ │
│  │  2. Fetch product info    │  │   │  │  2. Return product data       │ │
│  │  3. Calculate total       │◄─┼───┼──│                                │ │
│  │  4. Return order          │  │   │  └────────────────────────────────┘ │
│  └───────────────────────────┘  │   │                                      │
│                                 │   │  ┌────────────────────────────────┐ │
│  ┌───────────────────────────┐  │   │  │    GET /health                 │ │
│  │    Retry Logic            │  │   │  │    Service health check        │ │
│  │    Error Handling         │  │   │  └────────────────────────────────┘ │
│  │    Timeout Management     │  │   │                                      │
│  └───────────────────────────┘  │   └─────────────────────────────────────┘
└─────────────────────────────────┘
                    │                                   │
                    └─────────────────┬─────────────────┘
                                      │
                    ┌─────────────────▼─────────────────┐
                    │         DOCKER NETWORK            │
                    │     (Internal Communication)      │
                    └───────────────────────────────────┘
```

---

## Microservices Design Principles

### Service Independence

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | Each service handles one business domain |
| **Loose Coupling** | Services communicate via REST APIs |
| **Independent Deployment** | Each service has its own Dockerfile |
| **Data Isolation** | Services manage their own data |

### Communication Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYNCHRONOUS COMMUNICATION                     │
│                                                                  │
│   Order Service                              Product Service     │
│        │                                           │             │
│        │  HTTP GET /products/1                     │             │
│        │ ─────────────────────────────────────────►│             │
│        │                                           │             │
│        │  {"id":1,"name":"Laptop","price":999.99}  │             │
│        │ ◄─────────────────────────────────────────│             │
│        │                                           │             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Specifications

### Product Service

**Purpose**: Manages product catalog data

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/health` | GET | Health check | `{"service": "product-service", "status": "healthy"}` |
| `/products/<id>` | GET | Get product by ID | `{"id": 1, "name": "Laptop", "price": 999.99, "stock": 50}` |

**Product Data**:
```json
{
  "products": [
    {"id": 1, "name": "Laptop", "price": 999.99, "stock": 50},
    {"id": 2, "name": "Phone", "price": 699.99, "stock": 100},
    {"id": 3, "name": "Tablet", "price": 499.99, "stock": 75}
  ]
}
```

### Order Service

**Purpose**: Processes customer orders

| Endpoint | Method | Description | Request Body |
|----------|--------|-------------|--------------|
| `/health` | GET | Health check | - |
| `/orders` | POST | Create order | `{"product_id": 1, "quantity": 2}` |

**Success Response**:
```json
{
  "order_id": "ord_abc123",
  "product": "Laptop",
  "quantity": 2,
  "unit_price": 999.99,
  "total": 1999.98,
  "status": "confirmed"
}
```

---

## Fault Tolerance

### Error Handling Strategy

```
┌──────────────────────────────────────────────────────────────────┐
│                    FAULT TOLERANCE FLOW                           │
│                                                                   │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│   │   Request   │────►│   Try Call  │────►│   Success   │        │
│   └─────────────┘     └──────┬──────┘     └─────────────┘        │
│                              │                                    │
│                              │ Failure                            │
│                              ▼                                    │
│                       ┌─────────────┐                             │
│                       │   Retry     │◄───┐                        │
│                       │  (3 times)  │    │                        │
│                       └──────┬──────┘    │                        │
│                              │           │ Still failing          │
│                              │           │                        │
│                              ▼           │                        │
│                       ┌─────────────┐    │                        │
│                       │  Fallback   │────┘                        │
│                       │  Response   │                             │
│                       └─────────────┘                             │
│                              │                                    │
│                              ▼                                    │
│                       ┌─────────────┐                             │
│                       │   Return    │                             │
│                       │   Error     │                             │
│                       └─────────────┘                             │
└──────────────────────────────────────────────────────────────────┘
```

### Failure Scenarios

| Scenario | Behavior | Response |
|----------|----------|----------|
| Product service down | Graceful error | `{"error": "Product service unavailable"}` |
| Product not found | 404 handling | `{"error": "Product not found"}` |
| Network timeout | Retry with backoff | Automatic retry up to 3 times |
| Invalid request | Validation error | `{"error": "Invalid product_id"}` |

---

## Demo Workflows

### 1. Create Order (Success Flow)

```bash
# Step 1: Verify services are running
docker compose up -d

# Step 2: Check Product Service health
curl http://localhost:5001/health
# Response: {"service": "product-service", "status": "healthy"}

# Step 3: Get product information
curl http://localhost:5001/products/1
# Response: {"id": 1, "name": "Laptop", "price": 999.99, "stock": 50}

# Step 4: Create an order
curl -X POST http://localhost:5002/orders \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
# Response: {"order_id": "...", "total": 1999.98, "status": "confirmed"}
```

### 2. Simulate Failure

```bash
# Step 1: Stop Product Service
docker compose stop product-service

# Step 2: Attempt to create order
curl -X POST http://localhost:5002/orders \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
# Response: {"error": "Product service unavailable", "status": "failed"}

# Observe: Order Service handles failure gracefully without crashing
```

### 3. Recovery Scenario

```bash
# Step 1: Restart Product Service
docker compose start product-service

# Step 2: Wait for service to be healthy
sleep 5

# Step 3: Retry order creation
curl -X POST http://localhost:5002/orders \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
# Response: {"order_id": "...", "total": 1999.98, "status": "confirmed"}

# System recovered automatically
```

---

## Screenshots

### Containers Running
![Containers Running](screenshots/containers_running.png)

### Product Service Health
![Product Health](screenshots/product_health.png)

### Product Data Retrieval
![Product Data](screenshots/product_data.png)

### Order Creation Success
![Order Success](screenshots/order_success.png)

### Failure Simulation
![Failure Simulation](screenshots/failure_simulation.png)

### Service Recovery
![Recovery](screenshots/recovery.png)

### Service Communication Logs
![Logs](screenshots/logs.png)

---

## How to Run

### Prerequisites

- Docker and Docker Compose installed

### Start Services

```bash
# Navigate to Lab4
cd Lab4

# Build and start all services
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Product Service | http://localhost:5001 | Product catalog |
| Order Service | http://localhost:5002 | Order processing |

---

## Project Structure

```
Lab4/
├── docker-compose.yml       # Service orchestration
├── requirements.txt         # Shared Python dependencies
├── tests/                   # Integration tests
│
├── product-service/
│   ├── app.py              # Product service implementation
│   ├── Dockerfile          # Container definition
│   └── requirements.txt    # Service dependencies
│
└── order-service/
    ├── app.py              # Order service implementation
    ├── Dockerfile          # Container definition
    └── requirements.txt    # Service dependencies
```

---

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  product-service:
    build: ./product-service
    ports:
      - "5001:5001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  order-service:
    build: ./order-service
    ports:
      - "5002:5002"
    environment:
      - PRODUCT_SERVICE_URL=http://product-service:5001
    depends_on:
      - product-service
```

---

## Key Observations

| Observation | Significance |
|-------------|--------------|
| Service isolation | Each service can be developed and deployed independently |
| Network communication | Docker networking enables service discovery |
| Failure handling | System degrades gracefully instead of crashing |
| Recovery | Services resume normal operation after recovery |
| Observability | Logs show inter-service communication |

---

## Key Takeaways

1. **Microservices enable independent scaling** - Scale only the services that need it
2. **Service communication introduces latency** - Network calls add overhead
3. **Fault tolerance is essential** - Services must handle failures gracefully
4. **Docker Compose simplifies local development** - Easy service orchestration
5. **Health checks enable automation** - Kubernetes/Docker can manage service lifecycle

---

## Further Reading

- [Microservices Patterns](https://microservices.io/patterns/index.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Building Resilient Microservices](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/)
