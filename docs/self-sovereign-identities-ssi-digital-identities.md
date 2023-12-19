---
description: >-
  Incorporating the concept of Self-sovereign identities (SSI) into the metering
  process at the STROMDAO Energy Application Framework (EAF)
---

# Self sovereign identities (SSI) / Digital Identities

Incorporating the concept of Self-sovereign identities (SSI) into the metering process at the STROMDAO Energy Application Framework (EAF) adds a layer of user control and independence to digital identities. Under an SSI model, each entity has full control over their identity without depending on any centralized authority. Here is how the concept of SSI is integrated into the process described earlier:

1. **Price Information as SSI**: At STROMDAO EAF, every piece of price information is treated as an SSI. This means that the dynamic tariffs offered are not just cryptographic assertions but are also linked to dedicated decentralized identifiers (DIDs). A DID is a unique identifier that enables a verifiable, self-sovereign digital identity.
2. **DIDs for Price Signals**: The price information sent out with respect to the dynamic tariffs has its own DID, ensuring that it can be verified independently of any central system. Customers and other stakeholders can use these DIDs to authenticate the price information directly, thus ensuring that it has not been tampered with and is coming from a legitimate source.
3. **Consensus through Verification**: In order to establish consensus among electricity customers, utilities, meter point operators, and other parties, the SSI model allows each party to independently verify the validity of the price signal. They do this by checking the cryptographic signatures associated with the DIDs of the price SSIs.
4. **Transparency and Trust**: By treating price information as SSI with DIDs, the STROMDAO EAF ensures transparency in its communication with stakeholders. Customers can trust that they are being billed accurately because they can directly verify the pricing information themselves.
5. **Interoperability and Coordination**: The use of SSIs and DIDs facilitates interoperability among different systems and organizations involved in the energy market. Since DIDs are part of a standardized system for digital identities, anyone equipped with the appropriate tools can verify and accept these identities, streamlining coordination and reducing friction in transactions.
6. **Empowering Participants**: By implementing SSI principles, the STROMDAO EAF empowers all participants within the ecosystem. Customers are not just passive consumers but active participants who can manage and verify their interactions with their utilities and the larger energy market.

By treating each piece of price information as an SSI and assigning a dedicated DID to it, the STROMDAO EAF ensures that consensus and trust are built into the system, giving more control and assurance to the users of the platform. The use of SSIs and DIDs in metering demonstrates a commitment to data integrity, user autonomy, and innovation in the pursuit of a transparent and reliable energy market.

Note: SSI support requires at least [v0.2.18](https://github.com/energychain/STROMDAO\_EAFs/commit/ee832e322567917b9396284798172733c3e21bb1)
