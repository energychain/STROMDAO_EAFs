---
description: >-
  A client application designed for the STROMDAO Energy Application Frameworks
  and enables the transmission of electricity meter readings as without
  SmartMeterGateway
---

# Automated Meter Reading Client)

The [node-eaf-amr-client](https://www.npmjs.com/package/eaf-amr-client) (Automated Meter Reading Client) is a client application designed for the STROMDAO Energy Application Frameworks and enables the transmission of electricity meter readings as well as the inquiry of dynamic electricity tariffs without the need for a dedicated Smart Meter Gateway (iMSys). This facilitates the process of authentication, authorization, and cryptographic verification of automated meter readings by encapsulating most of the functional requirements in an easy-to-use Node.js module.

#### Core Functionality

The module provides two main methods:

* `updateReading(readingInWh, time)`: Submits the meter reading to the utility or tariff provider.
* `retrieveTariff()`: Retrieves a forecast of the tariffs and performs a cryptographic validation of the returned value.

#### Use Cases

The `node-eaf-amr-client` module can be used to transmit meter readings from an Energy Management System or a SmartHome platform to the utility provider or to retrieve electricity prices for planning and optimizing load/consumption. Especially in environments where no Smart Meter Gateway is present, this module offers an efficient and secure alternative to participate in dynamic electricity tariffs and manage energy consumption.

#### Advantages

* **Simplicity**: The straightforward integration into existing Energy Management Systems without the complexity of a physical gateway.
* **Flexibility**: Allows dynamic tariffs even for households without a Smart Meter Gateway.
* **Security**: Provides cryptographic methods that simulate the security aspects of an intelligent measuring infrastructure.

The easy implementation and handling of the `node-eaf-amr-client` make it an attractive solution for all players in the energy sector, from utility providers to developers of Smart Home applications who want to optimize their customers' energy consumption and support the energy transition.
