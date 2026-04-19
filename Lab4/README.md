# 🚀 Lab 4 — Advanced Microservices System with Docker

## 📌 Overview

This lab presents a **fully containerized microservices architecture** using Docker, where independent services communicate seamlessly to simulate a real-world distributed system.

The system consists of:

* 🧩 **Product Service** → manages product data
* 🧾 **Order Service** → handles order processing and communicates with Product Service

The goal is to demonstrate:

* Inter-service communication
* Fault tolerance & recovery
* Real-world microservices behavior

---

## 🏗️ System Architecture

```
Client → Order Service → Product Service
                ↓
           Docker Network
```

* Each service runs in an isolated container
* Communication occurs via Docker internal networking
* Services are loosely coupled and independently scalable

---

## ⚙️ Technologies Used

* 🐍 Python (Flask)
* 🐳 Docker & Docker Compose
* 🔗 REST APIs
* 🧠 Distributed Systems Concepts

---

## ▶️ How to Run

```bash
docker compose up --build
```

---

## 🔍 Services & Endpoints

### 🧩 Product Service

* `GET /health` → Service health check
* `GET /products/<id>` → Retrieve product details

---

### 🧾 Order Service

* `POST /orders` → Create new order

Example:

```bash
curl -X POST http://localhost:5002/orders \
-H "Content-Type: application/json" \
-d '{"product_id":1,"quantity":2}'
```

---

## 🧪 Demonstration Results

### 🟢 1. Containers Running

![Containers](screenshots/containers_running.png)

---

### 🟢 2. Product Service Health Check

![Health](screenshots/product_health.png)

---

### 🟢 3. Fetch Product Data

![Product](screenshots/product_data.png)

---

### 🟢 4. Order Creation (Success Scenario)

![Order](screenshots/order_success.png)

---

### 🔴 5. Failure Simulation (Product Service Down)

* Product Service is intentionally stopped
* Order Service detects failure
* System returns a controlled error

![Failure](screenshots/failure_simulation.png)

---

### 🔁 6. Recovery Scenario

* Product Service restarted
* System resumes normal operation

![Recovery](screenshots/recovery.png)

---

### 📜 7. Logs — Service Communication

This demonstrates internal communication between services:

* Order Service requesting data
* Product Service responding
* Network-level interaction

![Logs](screenshots/logs.png)

---

## ⚠️ Fault Tolerance Behavior

The system handles failures gracefully:

* Detects unavailable services
* Prevents system crash
* Returns meaningful error responses

This reflects real-world **resilience patterns in distributed systems**

---

## 📊 Key Observations

* Microservices improve modularity and scalability
* Docker simplifies deployment and isolation
* Network communication introduces latency
* Failure handling is essential for system reliability
* Service recovery enables high availability

---

## 💡 Reflection

This lab simulates how modern systems operate in production environments.

It highlights the importance of:

* Decoupled services
* Robust communication
* Fault tolerance
* Observability (logs & monitoring)

---

## 🏁 Conclusion

This implementation demonstrates a **production-inspired microservices system**, combining:

* Containerization
* Service interaction
* Failure handling
* Recovery mechanisms

It provides a strong foundation for building scalable and resilient cloud-native applications.

---
