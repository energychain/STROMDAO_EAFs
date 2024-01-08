# Installation as Docker Container

## Build from Dockerfile
```
docker build -t stromado-eaf .
```

## Run Image
```
docker run -it -P 3000:3000 -P 3001:3001 -P 3002:3002 --rm docker.io/library/stromado-eaf
```

## Run with a remote NATS server (to cluster with other STROMDAO EAF instances)
```
docker run -it -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 4222:4222 -e TRANSPORTER=nats://other_node:port --rm docker.io/library/stromado-eaf 
```
