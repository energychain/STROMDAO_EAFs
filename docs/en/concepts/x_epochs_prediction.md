# Prediction Service: `x_epochs` Method 

## Overview

The `x_epochs` method is a feature of the prediction service within the STROMDAO Energy Application Framework (EAF). It is designed to predict future electricity consumption for a specified number of [epochs](./epoch.md) (time ranges), by analyzing the historical consumption data from an electricity meter.

## Functionality

The method operates by examining the consumption history of a meter during past epochs. An epoch in this context is defined as a distinct period during which energy consumption is measured and associated with a dynamic tariff. By assessing how much electricity was consumed during these previous intervals, the method constructs a model to forecast future usage.

## Simple Prediction Model

The prediction model utilized by the `x_epochs` method is intentionally straightforward, allowing it to effectively function even with a limited historical dataset. This characteristic makes it particularly suited for meters that are newly integrated into the system and do not have an extensive history of recorded usage. The simplicity of the model also supports quick analysis and timely predictions, which are crucial for dynamic pricing strategies and efficient energy resource management.

## Sequential Readings and Periods

This method relies on sequential readings per period, meaning it takes consecutive data points from the meter readings and uses the established pattern to predict future consumption. The approach aligns with the nature of dynamic tariffs, where consumption patterns may vary from one period to the next, reflecting changes in user behavior, energy prices, or external factors.

## Usage in New Meters

For new meters added to the system, the `x_epochs` method can quickly adapt to the available data points, providing predictive insights even with a brief operational history. This allows energy providers to optimize their response and plan their resources accordingly, without the need for lengthy history accumulation.
