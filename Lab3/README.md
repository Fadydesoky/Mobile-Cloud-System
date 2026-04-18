## How to Run

### Build Image
docker build -f Dockerfile.basic -t lab3 .

### Run Container
docker run -p 5000:5000 lab3

### Kubernetes
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

## Observations

- Multi-stage Docker builds significantly reduce image size.
- Kubernetes ensures high availability through replica management.
- Self-healing behavior improves system reliability.
