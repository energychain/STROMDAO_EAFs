## How to Daemonize the STROMDAO Energy Application Framework (EAF) with pm2

### Introduction

The STROMDAO Energy Application Framework (EAF) is a Node.js-based platform for developing and deploying energy applications. It can be run as a daemon process using pm2, a process manager for Node.js applications. This guide will show you how to install pm2 and use it to daemonize the STROMDAO EAF.

### Prerequisites

-   Node.js 12 or higher
-   pm2

### Installation

To install pm2, run the following command:

```
npm install -g pm2
```

### Starting the STROMDAO EAF with pm2

To start the STROMDAO EAF with pm2, change into the framework folder of the STROMDAO EAF repository and run the following command:

```
pm2 start --name eaf npm -- start
```

This will start the STROMDAO EAF as a daemon process named "eaf". You can check the status of the process by running the following command:


```
pm2 status eaf
```

### Available Commands

Once the STROMDAO EAF is running with pm2, you can use the following commands to manage it:

-   `pm2 logs eaf`: Shows log output to the console
-   `pm2 restart eaf`: Restarts the framework
-   `pm2 stop eaf`: Stops the framework

For more information on pm2 commands, please refer to the pm2 documentation.

### Auto Start on System Boot

To configure the STROMDAO EAF to start automatically on system boot, you can use the following command:


```
pm2 startup
```

This will create a systemd service file for the STROMDAO EAF. You can then enable the service by running the following command:


```
systemctl enable pm2-eaf.service
```
