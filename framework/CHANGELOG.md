## [0.5.0](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.4.0...v0.5.0) (2024-01-15)


### Bug Fixes

* _id and id requirement for balancing_model. Fails with stateful backend (if MongoDB). ([39dfd49](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/39dfd496c8104ddad4446138dd0080b874be02d2))
* Added counter balancing update ([d477ba2](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/d477ba2bedf5e45a997eb5ad845ae2deb1c86e7e))

## [0.4.0](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.3.0...v0.4.0) (2024-01-14)


### Features

* Added methods to retrieve statement and balance of an epoch in balancing ([360bc7e](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/360bc7e3e05569bda972a196bd492aed253da731))
* Balancing issues events `transferfrom.$assetId`, `transferto.$assetId` and `balance.$assetId`. ([224ade2](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/224ade23d222bb9403a8e4d9a82d4302430feea2))


### Bug Fixes

* Balanc retrieval to allow more balances in one request. ([8ea053b](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/8ea053b98512145eb77a8be00e42543ac062655b))
* Balance model to include label for epoch. ([a245741](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/a245741241b87da5663b792f5202eb0ec13a10c7))
* Label Handling for balancing ([f5e0c1d](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/f5e0c1df901e023af16e95fbe863d9f6fc65cf2b))
* Orphaned call from clearing to balancing removed. ([13735e4](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/13735e4766d7dd9c868a586f36cdd240010a1c52))
* Parameter missmatch of balancing calls ([06157b9](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/06157b99dd3bd0b7eeb4ee2ecca114150e1de00c))

## [0.3.0](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.2.58...v0.3.0) (2024-01-14)


### Features

* Service for energy balancing. Managing a model for statements (energy ledger) and balancing (aggregation per epoch for each assetId and label) ([a3889da](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/a3889dac2c39715597cab9f73cfcf0fa19ad3199))

## [0.2.58](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.2.57...v0.2.58) (2024-01-13)


### Features

* InfluxDB Service listens to debit event add to allow cost/consumption analytics ([0528b38](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/0528b380f33a7821d860a31a447573d5b2b4ff98))


### Bug Fixes

* Add Identifier to measurements of event source within event ([83b2fec](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/83b2fec4fc17b7b7be57be623c43ad519ecaeedb))
