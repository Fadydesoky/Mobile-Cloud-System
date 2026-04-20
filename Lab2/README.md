# Lab 2: Distributed Systems and Consistency

This lab explores distributed systems concepts including data consistency, replication, and the fundamental trade-offs defined by the CAP theorem, using Redis as the distributed data store.

---

## Objectives

- Understand distributed system consistency models
- Implement and observe data replication between nodes
- Analyze the CAP theorem in practice
- Explore consensus algorithms and their role in distributed systems

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FLASK API LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │    /write       │  │  /read-primary  │  │  /read-replica  │          │
│  │  Write to       │  │  Read from      │  │  Read from      │          │
│  │  Primary Node   │  │  Primary Node   │  │  Replica Node   │          │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘          │
└───────────┼────────────────────┼────────────────────┼────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DISTRIBUTED DATA LAYER                              │
│                                                                          │
│   ┌─────────────────────┐         ┌─────────────────────┐               │
│   │   REDIS PRIMARY     │         │   REDIS REPLICA     │               │
│   │   (redis1)          │ ──────► │   (redis2)          │               │
│   │                     │  Async  │                     │               │
│   │   - Accepts writes  │  Repli- │   - Read-only       │               │
│   │   - Source of truth │  cation │   - Eventually      │               │
│   │                     │         │     consistent      │               │
│   └─────────────────────┘         └─────────────────────┘               │
│                                                                          │
│                    ◄── Replication Lag ──►                              │
│                    (Eventual Consistency)                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Consistency Models

### Strong Consistency
All nodes see the same data at the same time. Every read returns the most recent write.

### Eventual Consistency
Given enough time without new updates, all replicas will converge to the same value. Reads may return stale data temporarily.

### Comparison

| Model | Latency | Availability | Use Case |
|-------|---------|--------------|----------|
| Strong | Higher | Lower | Financial transactions |
| Eventual | Lower | Higher | Social media feeds |

---

## The CAP Theorem

The CAP theorem states that a distributed system can only guarantee two of three properties:

```
                        Consistency (C)
                             ▲
                            / \
                           /   \
                          /     \
                         /   ◆   \
                        /  Choose  \
                       /    Two     \
                      /             \
                     ▼               ▼
            Availability (A) ◄────► Partition Tolerance (P)
```

| Property | Definition |
|----------|------------|
| **Consistency** | All nodes see the same data at the same time |
| **Availability** | Every request receives a response |
| **Partition Tolerance** | System continues to operate despite network failures |

### Real-World Trade-offs

| System | Choice | Sacrifice |
|--------|--------|-----------|
| Traditional RDBMS | CA | Partition Tolerance |
| MongoDB, Cassandra | AP | Strong Consistency |
| Zookeeper, etcd | CP | Availability during partitions |

---

## Experiment: Observing Replication Lag

### Setup

The experiment uses two Redis nodes:
- **redis1**: Primary node (accepts writes)
- **redis2**: Replica node (read-only, receives replicated data)

### Steps

1. Write a value to the primary node
2. Immediately read from the replica node
3. Observe whether the value is present

### Results

![Redis Simulation](screenshots/redis-simulation.png)

**Observation**: Data written to the primary node was not immediately available on the replica. This demonstrates **replication lag** - a key characteristic of eventually consistent systems.

---

## Network Partitions

A network partition occurs when nodes cannot communicate with each other due to network failure.

```
┌─────────────────┐                    ┌─────────────────┐
│   Node A        │       ╳ ╳ ╳        │   Node B        │
│   (Primary)     │ ◄──── PARTITION ──►│   (Replica)     │
│                 │       ╳ ╳ ╳        │                 │
└─────────────────┘                    └─────────────────┘

During partition:
- Node A continues accepting writes
- Node B serves stale data
- System must choose: reject writes (CP) or accept divergence (AP)
```

### Handling Strategies

| Strategy | Behavior | Trade-off |
|----------|----------|-----------|
| Reject writes | Maintain consistency | Reduced availability |
| Accept writes | Maintain availability | Potential conflicts |
| Quorum-based | Balance both | Increased latency |

---

## Consensus Algorithms

Distributed systems use consensus algorithms to agree on values across nodes.

### Raft Consensus

Raft is used by systems like etcd and Consul:

```
┌──────────────────────────────────────────────────────────┐
│                    RAFT CONSENSUS                         │
│                                                           │
│   ┌─────────┐         ┌─────────┐         ┌─────────┐   │
│   │ LEADER  │ ──────► │FOLLOWER │         │FOLLOWER │   │
│   │         │         │         │ ◄────── │         │   │
│   └─────────┘         └─────────┘         └─────────┘   │
│        │                   ▲                   ▲         │
│        │                   │                   │         │
│        └───────────────────┴───────────────────┘         │
│                    Log Replication                        │
└──────────────────────────────────────────────────────────┘

1. Leader Election: One node becomes the leader
2. Log Replication: Leader replicates entries to followers
3. Safety: Only committed entries are applied
```

### Key Properties

- **Leader-based**: Single leader handles all writes
- **Majority quorum**: Requires (n/2)+1 nodes for consensus
- **Automatic failover**: New leader elected if current fails

---

## How to Run

### Prerequisites

- Docker and Docker Compose installed

### Start the Distributed System

```bash
# Navigate to Lab2
cd Lab2

# Start Redis nodes and API
docker compose up --build

# The system exposes:
# - API: http://localhost:5000
# - Redis Primary: localhost:6379
# - Redis Replica: localhost:6380
```

### Test Replication

```bash
# Write to primary
curl "http://localhost:5000/write?key=test&value=hello"

# Read from primary (should return immediately)
curl "http://localhost:5000/read-primary?key=test"

# Read from replica (may show replication lag)
curl "http://localhost:5000/read-replica?key=test"
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/write?key=X&value=Y` | GET | Write key-value to primary |
| `/read-primary?key=X` | GET | Read from primary node |
| `/read-replica?key=X` | GET | Read from replica node |
| `/health` | GET | Health check |

---

## Key Takeaways

1. **Distributed systems require trade-offs** between consistency, availability, and partition tolerance
2. **Replication lag is unavoidable** in eventually consistent systems
3. **Consensus algorithms** (like Raft) provide mechanisms for agreement across nodes
4. **System design choices** depend on application requirements (e.g., financial systems need strong consistency)

---

## Performance Considerations

| Factor | Impact | Mitigation |
|--------|--------|------------|
| Replication Lag | Stale reads | Read from primary for critical data |
| Network Latency | Slower consensus | Optimize network topology |
| Node Failures | Reduced availability | Increase replica count |

---

## Further Reading

- [CAP Theorem Explained](https://www.ibm.com/topics/cap-theorem)
- [Raft Consensus Algorithm](https://raft.github.io/)
- [Redis Replication](https://redis.io/docs/manual/replication/)
