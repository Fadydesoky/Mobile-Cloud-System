# Lab 1 - Virtualization and Cloud

## Objective
This lab explores virtualization concepts, cloud infrastructure, and latency behavior.

## VM vs Containers
Containers are lightweight and start quickly.
Virtual Machines provide stronger isolation but consume more resources.

## VM vs Container Observation

Containers started in seconds with minimal memory usage, while virtual machines required significantly more time and resources.

## Latency Analysis

The response time distribution showed a long tail due to random delays, indicating variability under concurrent load.

## AWS Nitro
AWS uses Nitro Hypervisor to improve performance and security by offloading virtualization tasks to hardware.

## Tail Latency
Latency varies due to delays in processing.
Tail latency increases when the system is under load.

## How to Run

### Build Docker Image
docker build -t lab1 .

### Run Container
docker run -p 5000:5000 lab1

### Access
Open browser and go to:
http://localhost:5000

## Observation

Containers showed significantly faster startup time compared to virtual machines.
