<p align="center">
  <img src="https://img.shields.io/badge/Lab-02-green?style=for-the-badge&logo=redis&logoColor=white" alt="Lab 2"/>
  <img src="https://img.shields.io/badge/Topic-Distributed_Systems-red?style=for-the-badge" alt="Distributed Systems"/>
  <img src="https://img.shields.io/badge/Database-Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
</p>

<h1 align="center">Distributed Systems & Consistency</h1>

<p align="center">
  <i>Exploring replication, consensus, and the CAP theorem</i>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> |
  <a href="#-architecture">Architecture</a> |
  <a href="#-cap-theorem">CAP Theorem</a> |
  <a href="#-experiments">Experiments</a>
</p>

---

## Overview

This lab dives deep into **distributed systems fundamentals** using Redis as our distributed data store. You'll observe replication lag, understand consistency trade-offs, and explore the algorithms that keep distributed systems in sync.

### What You'll Learn

| Concept | Description |
|---------|-------------|
| Replication | How data propagates from primary to replica nodes |
| Consistency Models | Strong vs eventual consistency trade-offs |
| CAP Theorem | Why distributed systems must choose between C, A, and P |
| Raft Consensus | How nodes agree on values in distributed systems |

---

## Quick Start

```bash
# Start the distributed system
docker compose up --build

# Write to primary node
curl "http://localhost:5000/write?key=test&value=hello"

# Read from primary (immediate consistency)
curl "http://localhost:5000/read-primary?key=test"

# Read from replica (may show lag)
curl "http://localhost:5000/read-replica?key=test"
```

---

## Architecture

```
+------------------------------------------------------------------------+
|                           FLASK API LAYER                               |
|  +------------------+  +------------------+  +------------------+       |
|  |    /write        |  |  /read-primary   |  |  /read-replica   |      |
|  |  Write to        |  |  Read from       |  |  Read from       |      |
|  |  Primary Node    |  |  Primary Node    |  |  Replica Node    |      |
|  +--------+---------+  +--------+---------+  +--------+---------+      |
+-----------|--------------------|--------------------|-----------------+
            |                    |                    |
            v                    v                    v
+------------------------------------------------------------------------+
|                      DISTRIBUTED DATA LAYER                             |
|                                                                         |
|   +------------------------+         +------------------------+        |
|   |    REDIS PRIMARY       |         |    REDIS REPLICA       |        |
|   |    (redis1:6379)       | ======> |    (redis2:6380)       |        |
|   |                        |  Async  |                        |        |
|   |   * Accepts writes     | Replic- |   * Read-only          |        |
|   |   * Source of truth    |  ation  |   * Eventually         |        |
|   |   * Port 6379          |         |     consistent         |        |
|   +------------------------+         +------------------------+        |
|                                                                         |
|                  <---- Replication Lag ---->                           |
|                    (Eventual Consistency)                               |
+------------------------------------------------------------------------+
```

---

## CAP Theorem

The CAP theorem states that a distributed system can only guarantee **two of three properties**:

```
                         CONSISTENCY (C)
                        All nodes see the
                        same data at the
                           same time
                              /\
                             /  \
                            /    \
                           /      \
                          /   ??   \
                         /  CHOOSE  \
                        /    TWO     \
                       /              \
                      /________________\
   AVAILABILITY (A)                      PARTITION
  Every request gets                    TOLERANCE (P)
     a response                      System works despite
                                      network failures
```

### Real-World Trade-offs

| System | Chooses | Sacrifices | Use Case |
|--------|---------|------------|----------|
| **Traditional RDBMS** | CA | Partition Tolerance | Single-server databases |
| **MongoDB, Cassandra** | AP | Strong Consistency | Social media, analytics |
| **Zookeeper, etcd** | CP | Availability during partitions | Configuration, coordination |

> **Our Lab**: Redis with async replication demonstrates **AP** behavior - prioritizing availability and partition tolerance over immediate consistency.

---

## Consistency Models

### Strong Consistency

```
Write(x=5)              Read(x)
    |                      |
    v                      v
+--------+            +--------+
|   x=5  | =========> |   x=5  |  Always returns latest value
+--------+            +--------+
Primary               Any Node
```

- **Guarantee**: Every read returns the most recent write
- **Trade-off**: Higher latency, reduced availability
- **Use case**: Financial transactions, inventory systems

### Eventual Consistency

```
Write(x=5)              Read(x)         Read(x)         Read(x)
    |                      |               |               |
    v                      v               v               v
+--------+            +--------+      +--------+      +--------+
|   x=5  | ---------> |  x=?   | ---> |  x=?   | ---> |   x=5  |
+--------+    Lag     +--------+      +--------+      +--------+
Primary               Replica         Replica         Replica
                      (stale)         (stale)         (converged)
```

- **Guarantee**: Given enough time, all replicas converge
- **Trade-off**: May read stale data temporarily
- **Use case**: Social media feeds, shopping carts

---

## Experiments

### Experiment 1: Observing Replication Lag

```bash
# Step 1: Write a value to primary
curl "http://localhost:5000/write?key=experiment&value=test123"

# Step 2: Immediately read from replica
curl "http://localhost:5000/read-replica?key=experiment"
# Result: May return null (replication hasn't completed)

# Step 3: Wait 100ms and read again
sleep 0.1 && curl "http://localhost:5000/read-replica?key=experiment"
# Result: Returns "test123" (data has replicated)
```

### Experiment 2: Simulating Network Partition

```bash
# Step 1: Disconnect replica from primary
docker network disconnect lab2_default redis2

# Step 2: Write to primary (succeeds - AP system)
curl "http://localhost:5000/write?key=partition&value=during"

# Step 3: Read from replica (returns stale/null)
curl "http://localhost:5000/read-replica?key=partition"

# Step 4: Reconnect and observe convergence
docker network connect lab2_default redis2
sleep 1
curl "http://localhost:5000/read-replica?key=partition"
# Result: Eventually returns "during"
```

---

## Consensus: Raft Algorithm

Distributed systems use consensus algorithms like **Raft** to agree on values:

```
+----------------------------------------------------------------+
|                       RAFT CONSENSUS                            |
|                                                                 |
|   +------------+        +------------+        +------------+   |
|   |   LEADER   | -----> |  FOLLOWER  |        |  FOLLOWER  |   |
|   |   Node 1   |        |   Node 2   | <----- |   Node 3   |   |
|   +------------+        +------------+        +------------+   |
|        |                      ^                     ^          |
|        |                      |                     |          |
|        +----------------------+---------------------+          |
|                    Log Replication                              |
|                                                                 |
|   STEPS:                                                        |
|   1. Leader Election - One node becomes leader                  |
|   2. Log Replication - Leader replicates entries to followers   |
|   3. Safety - Only committed entries are applied                |
|   4. Majority Quorum - Requires (n/2)+1 nodes for consensus     |
+----------------------------------------------------------------+
```

### Why Raft Matters

| Property | Benefit |
|----------|---------|
| Leader-based | Single point for writes simplifies consistency |
| Majority quorum | Tolerates (n-1)/2 failures |
| Automatic failover | New leader elected if current fails |
| Understandable | Designed for clarity (unlike Paxos) |

---

## API Reference

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/write?key=X&value=Y` | GET | Write to primary | `/write?key=name&value=John` |
| `/read-primary?key=X` | GET | Read from primary | `/read-primary?key=name` |
| `/read-replica?key=X` | GET | Read from replica | `/read-replica?key=name` |
| `/health` | GET | Health check | Returns service status |

---

## Screenshots

### Redis Replication Simulation
![Redis Simulation](screenshots/redis-simulation.png)

*Demonstrating write to primary and observing replication lag on replica*

---

## Service Ports

| Service | Port | Purpose |
|---------|------|---------|
| Flask API | 5000 | Application layer |
| Redis Primary | 6379 | Primary data node |
| Redis Replica | 6380 | Replica data node |

---

## Key Takeaways

1. **Distributed systems require trade-offs** - You cannot have consistency, availability, AND partition tolerance
2. **Replication lag is unavoidable** in eventually consistent systems
3. **Consensus algorithms** (like Raft) provide mechanisms for agreement across nodes
4. **System design choices** depend on application requirements - financial systems need strong consistency, social media can tolerate eventual consistency

---

## Further Reading

- [CAP Theorem Explained](https://www.ibm.com/topics/cap-theorem)
- [Raft Consensus Visualization](https://raft.github.io/)
- [Redis Replication](https://redis.io/docs/manual/replication/)
- [Designing Data-Intensive Applications](https://dataintensive.net/)

---

<p align="center">
  <a href="../Lab1/README.md">Previous: Lab 1 - Virtualization</a> |
  <a href="../README.md">Back to Main README</a> |
  <a href="../Lab3/README.md">Next: Lab 3 - Container Orchestration</a>
</p>
