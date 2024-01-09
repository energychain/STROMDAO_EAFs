**The [STROMDAO Energy Application Framework (EAF)](https://github.com/energychain/STROMDAO_EAFs) is a framework built on microservices that enable the efficient implementation of dynamic electricity rates following EAF-10 standards. The services provided are an integration point for the various tasks and use cases that must be considered when introducing dynamic electricity tariffs. STROMDAO EAF acts as a reference implementation, which can either be configured as needed or adapted to the specific requirements of an energy supplier, thanks to its open architecture.**

### About the Docker Image
- Runs a single node installation of STROMDAO EAF.
 - Exposes the following ports via HTTP:
    - 3000 (Administration)
    - 3001 (Metering)
    - 3002 (Customer Web Application)

To use an image in a cluster of other nodes, set the environment variable TRANSPORTER to nats://other_node:port.
All nodes in an environment need to share the same keys. The key folder can be made available to the container using `-v host_folder:/app/keys`.

### General Usage
```
docker pull stromdao/eaf
docker run -it -p 3001:3001 -p 3002:3002 -p 3003:3003 stromdao/eaf
```

### Additional Information

The STROMDAO EAF is open source and available on GitHub: https://github.com/STROMDAO/stromdao-eaf
The Docker image is published on Docker Hub: https://hub.docker.com/r/stromdao/eaf

For more information about the STROMDAO EAF, please visit the STROMDAO website: https://stromdao.de/

### License

The STROMDAO EAF is licensed under the [Apache License 2.0](https://raw.githubusercontent.com/energychain/STROMDAO_EAFs/main/LICENSE).