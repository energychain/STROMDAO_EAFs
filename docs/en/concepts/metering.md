# Metering 

## Overview of Metering in STROMDAO EAF

The STROMDAO Energy Application Framework (EAF) does not perform measurements itself but relies on sensors or electricity meters that transmit data either by pushing it to the framework or by allowing the framework to retrieve the data. Due to the wide variety of available electricity meters and their backend systems, STROMDAO EAF is designed with minimal requirements for the SmartMeter.

## Compatibility with Various Meters

Dynamic electricity tariffs based on the STROMDAO EAF can be implemented in parallel with read heads, intelligent metering systems (iMSyS), or DIN rail meters with remote reading capabilities, without the electricity tariff product design having to explicitly differentiate between these options. This compatibility ensures that STROMDAO EAF can be widely adopted regardless of the existing infrastructure.

## The Metering Service

The "Metering Service" acts as the central interface within the EAF for processing meter readings. This service enables the concept of incremental metering, where each meter reading requires a timestamp and the meter reading in watt-hours (Wh). No additional data is necessary for the processing of a meter reading, and the framework does not process any other data.

### Meter Reading Time-Series Measurement

Implemented within the Metering Service is the principle of time-series measurement of meter readings. This means that for a reading to be processed, only the timestamp of the reading and the meter reading in watt-hours are required. This streamlined approach facilitates efficient and effective handling of meter data and supports the accuracy of settlements and billing within the EAF.

## Conclusion

The metering concept within STROMDAO EAF is designed to be efficient and unobtrusive, requiring minimal data to perform accurate and timely energy billing for dynamic tariffs. By focusing solely on the timestamp and the watt-hour meter reading, STROMDAO EAF maintains a lightweight and adaptable metering interface suitable for a wide range of metering devices and provides the flexibility needed for varied energy usage scenarios.