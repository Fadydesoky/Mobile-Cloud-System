# Lab 2 - Distributed Consistency and Cloud Systems

## Objective
This lab explores distributed systems concepts, consistency, and cloud-based deployments.

## Containers vs Virtual Machines
Containers are more efficient and scalable for modern cloud applications.
Virtual Machines provide stronger isolation and are useful for legacy systems.

## Cloud Infrastructure
Cloud platforms provide scalable resources and distributed environments for applications.

## Redis Replication

Redis replication demonstrates eventual consistency where replicas may lag behind the primary node.

## Network Partition

When a node is disconnected, writes may not propagate immediately, illustrating CAP trade-offs.

## Raft Consensus

etcd uses the Raft algorithm to elect a leader and maintain consistency across nodes.

## Observation

Leader re-election occurs automatically when the leader node fails, ensuring system availability.

## Consistency
In distributed systems, maintaining consistency between nodes is challenging and depends on coordination and communication.

## Performance
System performance may vary depending on workload distribution and resource usage.


Consistency models like eventual consistency are commonly used in cloud systems to balance performance and reliability.

Distributed systems often sacrifice strong consistency in favor of availability and scalability (CAP theorem).
