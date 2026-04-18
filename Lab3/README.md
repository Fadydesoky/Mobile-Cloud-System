## How to Run

### Build Image
docker build -f Dockerfile.basic -t lab3 .

### Run Container
docker run -p 5000:5000 lab3

### Kubernetes (optional)
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
