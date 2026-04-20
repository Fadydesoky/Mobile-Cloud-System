<p align="center">
  <img src="https://img.shields.io/badge/Lab-01-blue?style=for-the-badge&logo=amazonaws&logoColor=white" alt="Lab 1"/>
  <img src="https://img.shields.io/badge/Topic-Virtualization-orange?style=for-the-badge" alt="Virtualization"/>
  <img src="https://img.shields.io/badge/Cloud-AWS_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white" alt="AWS EC2"/>
</p>

<h1 align="center">Virtualization & Cloud Fundamentals</h1>

<p align="center">
  <i>Understanding the building blocks of cloud infrastructure</i>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> |
  <a href="#-architecture">Architecture</a> |
  <a href="#-key-concepts">Key Concepts</a> |
  <a href="#-screenshots">Screenshots</a>
</p>

---

## Overview

This lab explores the **foundational concepts** of virtualization, containerization, and cloud infrastructure. You'll gain hands-on experience with latency analysis and understand how AWS EC2 powers modern cloud applications.

### What You'll Learn

| Concept | Description |
|---------|-------------|
| VMs vs Containers | Compare startup times, memory overhead, and isolation levels |
| Tail Latency | Understand P99 and P99.9 latency impact on user experience |
| AWS Nitro | Explore AWS's purpose-built hypervisor architecture |
| Performance Metrics | Analyze response time distributions in cloud apps |

---

## Quick Start

```bash
# Build and run with Docker
docker build -t lab1-api .
docker run -p 5000:5000 lab1-api

# Test the API
curl http://localhost:5000
curl http://localhost:5000/data?size=100
curl http://localhost:5000/health
```

---

## Architecture

```
                    +---------------------------+
                    |      CLIENT REQUEST       |
                    +-------------+-------------+
                                  |
                                  v
+------------------------------------------------------------------+
|                        FLASK API SERVER                           |
|                                                                   |
|   +-----------------------------------------------------------+  |
|   |  GET /                                                    |  |
|   |  - Simulates network latency (random delay 0.1-0.5s)      |  |
|   |  - Returns: {"message": "Mobile Cloud API", "delay": X}   |  |
|   +-----------------------------------------------------------+  |
|                                                                   |
|   +-----------------------------------------------------------+  |
|   |  GET /data?size=N                                         |  |
|   |  - Generates dataset of N items                           |  |
|   |  - Simulates data retrieval with latency                  |  |
|   +-----------------------------------------------------------+  |
|                                                                   |
|   +-----------------------------------------------------------+  |
|   |  GET /health                                              |  |
|   |  - Returns: {"status": "healthy"}                         |  |
|   +-----------------------------------------------------------+  |
+------------------------------------------------------------------+
                                  |
                                  v
+------------------------------------------------------------------+
|                     CONTAINER / VM RUNTIME                        |
|              (Docker Container or AWS EC2 Instance)               |
+------------------------------------------------------------------+
```

---

## Key Concepts

### VM vs Container Comparison

<table>
<tr>
<th>Aspect</th>
<th>Virtual Machine</th>
<th>Container</th>
</tr>
<tr>
<td><b>Startup Time</b></td>
<td>30-60 seconds</td>
<td>1-2 seconds</td>
</tr>
<tr>
<td><b>Memory Overhead</b></td>
<td>High (full OS per VM)</td>
<td>Low (shared kernel)</td>
</tr>
<tr>
<td><b>Isolation</b></td>
<td>Strong (hardware-level)</td>
<td>Moderate (process-level)</td>
</tr>
<tr>
<td><b>Portability</b></td>
<td>Limited</td>
<td>High</td>
</tr>
<tr>
<td><b>Best For</b></td>
<td>Legacy apps, strict isolation</td>
<td>Microservices, rapid scaling</td>
</tr>
</table>

> **Why Containers Win for Microservices**: Containers share the host OS kernel, eliminating the need for a separate operating system per instance. This results in faster deployment, better resource utilization, and consistent environments.

---

### Latency Analysis

The application simulates real-world cloud latency patterns:

```
Response Time Distribution
--------------------------

Count
  ^
  |   ****
  |  ******
  | ********
  |**********
  |************
  |**************                       * * *
  +---------------------------------->  Response Time
      Fast            Median            Tail (P99)
      
Most requests are fast, but a "tail" of slower requests always exists.
```

#### Percentile Breakdown

| Percentile | Meaning | Impact |
|------------|---------|--------|
| **P50** (Median) | Half of requests are faster | Typical user experience |
| **P90** | 90% of requests are faster | 1 in 10 users see this delay |
| **P99** | 99% of requests are faster | 1 in 100 users affected |
| **P99.9** | 99.9% of requests are faster | Critical for high-traffic systems |

> **Why Tail Latency Matters**: In systems handling millions of requests, even P99.9 latency affects thousands of users daily. Causes include garbage collection, network congestion, resource contention, and cold starts.

---

### AWS Nitro Hypervisor

AWS Nitro is a purpose-built system that powers modern EC2 instances:

```
+----------------------------------------------------------+
|                    AWS NITRO SYSTEM                       |
+----------------------------------------------------------+
|                                                           |
|   +-------------------+   +-------------------+           |
|   |   Nitro Cards     |   |   Nitro Security  |          |
|   |                   |   |      Chip         |          |
|   | - VPC networking  |   | - Hardware root   |          |
|   | - EBS storage     |   |   of trust        |          |
|   | - Instance storage|   | - Secure boot     |          |
|   +-------------------+   +-------------------+           |
|                                                           |
|   +-------------------+   +-------------------+           |
|   | Nitro Hypervisor  |   |   Nitro Enclaves  |          |
|   |                   |   |                   |          |
|   | - Lightweight     |   | - Isolated compute|          |
|   | - Near bare-metal |   | - Sensitive data  |          |
|   |   performance     |   |   processing      |          |
|   +-------------------+   +-------------------+           |
+----------------------------------------------------------+
```

| Feature | Benefit |
|---------|---------|
| Hardware Offloading | Networking and storage handled by dedicated hardware |
| Security | Isolation enforced at the hardware level |
| Performance | Near bare-metal performance for instances |
| Efficiency | More resources available for customer workloads |

---

## API Reference

| Endpoint | Method | Description | Example Response |
|----------|--------|-------------|------------------|
| `/` | GET | Root with simulated delay | `{"message": "Mobile Cloud API", "delay": 0.23}` |
| `/data?size=N` | GET | Generate N data items | `{"data": [...], "count": N}` |
| `/health` | GET | Health check | `{"status": "healthy"}` |

---

## Screenshots

### AWS EC2 Instance
![AWS EC2 Instance](screenshots/aws-ec2.png)

### Latency Distribution Analysis
![Latency Histogram](screenshots/latency.png)

### System Memory Utilization
![System Memory](screenshots/system-memory.png)

---

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py

# Access at http://localhost:5000
```

---

## Key Takeaways

1. **Containers are more efficient** than VMs for microservices due to shared kernel architecture
2. **Tail latency (P99, P99.9)** is a critical metric that affects real user experience
3. **AWS Nitro** provides near bare-metal performance with hardware-level security
4. **Performance monitoring** is essential for understanding system behavior under load

---

## Further Reading

- [AWS Nitro System](https://aws.amazon.com/ec2/nitro/)
- [Understanding Tail Latency](https://www.brendangregg.com/blog/2014-07-24/latency-analysis-with-bcc.html)
- [Docker vs VMs](https://www.docker.com/resources/what-container/)

---

<p align="center">
  <a href="../README.md">Back to Main README</a> |
  <a href="../Lab2/README.md">Next: Lab 2 - Distributed Systems</a>
</p>
