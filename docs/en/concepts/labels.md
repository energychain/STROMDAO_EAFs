#### Purpose of Tariff Labels

Within the STROMDAO Energy Application Framework (EAF), "Tariff Labels" are used as descriptive identifiers to mark specific price segments within the energy billing process. They serve as assignment units between an easily understandable designation and a corresponding electricity price.

#### Use of Labels

Typical examples of such labels are "Peak Tariff" and "Off-Peak Tariff," which can be assigned to different times of the day or load situations. In practice, the EAF can use a multitude of labels to represent a wide range of tariff structures.

#### Uniqueness in Time Slices

A critical feature of the Tariff Label concept is that each time slice ([EPOCH](./epoch.md)) always bears only a single label. This ensures a clear and unambiguous allocation of electricity prices to the respective tariff segments.

#### Internal vs. External Labels

STROMDAO EAF works internally with a set number of labels, denoted as "virtual_1" to "virtual_n," where "n" corresponds to the number of distinct tariff segments.

These internal identifiers ensure the consistency and integrity of the system and are part of the EAF's core logic. External tariff designations, on the other hand, are configurable and can be adapted to different markets and languages.

#### Multilingualism and Product Adaptation

The separation between internal identifiers and externally configurable designations allows the EAF to provide multilingual electricity products. The Tariff Labels can be adapted to the national language depending on the target market and customer group, without necessitating changes to the internal logic or product design. This enables high flexibility and scalability in designing electricity tariffs and facilitates the international application of the framework.

#### Conclusion

The concept of Tariff Labels in the STROMDAO EAF is fundamental for creating clear, customer-friendly electricity tariffs. It allows for a flexible and dynamic pricing structure tailored to the individual needs and languages of customers while keeping the EAF's internal billing logic precise and unchanged. The use of Tariff Labels makes the billing process more transparent and easier for the end consumer to understand.