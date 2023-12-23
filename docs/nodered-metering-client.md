# NodeRED Metering Client

The project[ nr-eaf-amr](https://flows.nodered.org/node/nr-eaf-amr) is a Node-RED package that simplifies the integration and automation of dynamic electricity tariffs within energy management systems. It interacts with the STROMDAO Energy Application Framework (EAF), enhancing the ability to respond to variable energy pricing in real-time.

The package includes three distinct nodes:

1. **SendReading:** This node securely transmits meter readings to utilities, ensuring proper authorization and communication. It retrieves settlements between the consumer and the utility company. The relevant code for this node can be found in nr-meterreading.js.
2. **Tariff:** This node retrieves price signals, which are forecasts of electricity prices from the utility. It allows for strategic planning and proactive adjustments within home energy management systems. The relevant code for this node can be found in nr-tariff.js.
3. **BestPrice:** This node utilizes the tariff signal to control devices or consumers, turning them on or off during periods of low electricity prices. This capability is instrumental in optimizing energy costs by shifting energy consumption to the most economical time frames. The relevant code for this node can be found in nr-bestPrice.js.

The package also includes a configuration node eaf-credentials for setting up the metering API base URL, meter ID, and authorization credentials. The relevant code for this node can be found in [eaf-credentials.js](https://github.com/energychain/nr-eaf-amr/blob/main/eaf-credentials.html).

The project is maintained by [STROMDAO GmbH](https://stromdao.de/), a German company specializing in energy solutions. The code is licensed under the Apache-2.0 License.
