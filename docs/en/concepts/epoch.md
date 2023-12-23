**Definition of an EPOCH**

In the STROMDAO Energy Application Framework (EAF), the concept of an "EPOCH" or time slice is used to define dedicated time segments within which a specific electricity price applies. An EPOCH is defined as the period that starts at a specified time on a given day and ends at another time on the same day.

**Exclusivity of EPOCHs**

A key feature of the EPOCH concept is that no two EPOCHs can cover the same time on a given day. This ensures a clear and unambiguous assignment of electricity prices to specific time windows.

**Setting the Duration of an EPOCH**

The duration of an EPOCH is determined in the runtime configuration by the environment variable `EPOCH_DURATION`. The value of this variable represents the length of the time slice in milliseconds. For example, a value of `EPOCH_DURATION: 3600000` indicates that the duration of an EPOCH is one hour.

**Configuration Changes**

Adjustments to the `EPOCH_DURATION` may only be made when there is no existing data, i.e., during the system setup. Existing datasets must not be altered as the STROMDAO EAF does not support such changes. A specialized data migration would be necessary in this case.

**Consumption Allocation Based on EPOCHs**

In the context of settlement, clearing, and billing, consumption allocation is always based on the EPOCH. The consumption is assigned to the respective EPOCHs to ensure accurate billing. Subdivision into smaller time periods than the specified EPOCH is not provided for in the STROMDAO EAF. This approach creates a structured and transparent billing foundation that ensures the uniformity and reliability of the billing system.