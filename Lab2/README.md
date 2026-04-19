# Lab 2 - Distributed Consistency and Cloud Systems

## Objective
This lab explores distributed systems concepts such as consistency, replication, and fault tolerance using a simulated Redis environment.

---

## Application Overview

A minimal distributed setup was simulated using two Redis nodes:
- redis1 (primary node)
- redis2 (secondary node)

This setup is used to observe how data behaves across multiple nodes in a distributed system.

---

## Application Integration

A simple Flask API was used to simulate interaction with Redis nodes.

Endpoints:
- `/write` → writes data to the primary node  
- `/read-primary` → reads data from the primary node  
- `/read-replica` → reads data from the secondary node  

This demonstrates how applications interact with distributed systems in real-world scenarios.

## Redis Simulation

![Redis Simulation](screenshots/redis-simulation.png)

---

## Experiment Steps

1. A value was written to the primary node.
2. The same value was requested from the secondary node.
3. The results were compared between both nodes.

## Observation

- Data written to the primary node was not immediately available in the secondary node.
- This indicates a delay in data propagation between nodes.

---

## Interpretation

This behavior reflects **eventual consistency**, where replicas may not instantly reflect the latest data.

---

## Consistency in Distributed Systems

Maintaining consistency across distributed nodes is challenging due to:
- Network delays  
- Replication lag  
- Node failures  

---

## CAP Theorem

Distributed systems must balance between:
- Consistency  
- Availability  
- Partition Tolerance  

In most real-world systems, a trade-off is made to achieve scalability and availability.

---

## Network Partition

When a node becomes unreachable:
- Updates may not propagate  
- Systems must choose between consistency and availability  

---

## Raft Consensus

Systems like etcd use the Raft algorithm to:
- Elect a leader  
- Synchronize state across nodes  
- Handle failures automatically  

---

## Performance Considerations

- Replication improves availability  
- Asynchronous replication may introduce delays  
- Trade-offs are required for scalability  

---

## Key Insight

Even a simple distributed setup demonstrates real-world challenges in maintaining consistency, highlighting the importance of system design in cloud environments. This highlights the trade-offs between consistency and availability in distributed systems.

---

## Conclusion

This lab demonstrates how distributed systems handle data consistency and replication.

It shows that:
- Data consistency is not always immediate  
- Distributed systems require trade-offs  
- System design plays a critical role in performance and reliability
- The setup can be extended to include replication between nodes to simulate real-world distributed systems behavior.
