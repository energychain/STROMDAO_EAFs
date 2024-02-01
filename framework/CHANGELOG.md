## [0.6.4](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.6.3...v0.6.4) (2024-02-01)


### Bug Fixes

* Improved UI for balancing to make it more clearer what happens. ([82a7771](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/82a777150f2847f2c2771e2f401d737e353ec0c8))

## [0.6.3](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.6.2...v0.6.3) (2024-01-30)


### Bug Fixes

* Datalables of PWA are now visible. Using CDNs for Chart JS. ([f962a00](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/f962a0061b26dc2159ad379ffda575f01e09c102))
* Handling of internal balance sum now in homogenized field `balancesum` allowing to calculate internal energy exchange of a balancing point. ([93e52e5](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/93e52e5e2af763faa64c0d3dd0d557c839bbde46))
* PWA supports "Standard" and prosumer view. ([8ac0986](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/8ac09861a04cbb61aea714f40e10cac405c42163))

## [0.6.2](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.6.1...v0.6.2) (2024-01-28)

### Increment

Add Balancing Helper UI Component to EAF

The Balancing Helper UI component has been integrated into the Energy Application Framework (EAF). The component allows users to configure energy balancing for a specific balancing point through the 'uc_balancing.html' page in the admin interface. This update facilitates defining which metering points feed into a balancing point and which of them draw energy from it, enabling applications such as community energy collectives, tenant power models, and cloud storage solutions to operate effectively.

- Implemented Balancing Helper on `uc_balancing.html`
- Added configuration options for injection and withdrawal metering points
- Enabled configuration of energy balancing for different use cases
- Included documentation and help tooltips for user guidance
- Improved admin interface for seamless navigation to Balancing Helper settings

## [0.6.1](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.6.0...v0.6.1) (2024-01-28)


### Bug Fixes

* Adding assets method to allow searching for metering service ([59f9b42](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/59f9b423ab8ccae757f3d2ee4cb4577a75123f9c))
* Avoid throwing exception in case balance could not be sealed. Blocks energy community operation. ([7b770e5](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/7b770e5db73a3da866e46e298f7191886921e064))
* Balance UI Chart is now left=old right=new ([4b5488b](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/4b5488ba150964e01a2432b51ba3149f9dd24764))
* debit.assets search allows prefix search on meterId field. ([195e520](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/195e520b2575fac4e8e0cf5321b9d96d510e0e60))
* detach from metering call for balancing removed to allow tracing. (temp) ([a77c0a9](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/a77c0a9505063ce3e30c7f69f2dad16f463bce0c))
* Increase timeout (now 60s) to allow operation on slow Influx servers like on a RPi. ([87ce563](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/87ce5633b37d334a381622fd175a2f94a9558987))
* Local GET API Request handler for isSealed must be issealed not balance ([2533941](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/2533941e36f314e29167bdd7c849db06e614df51))
* Missing ";" in meritorder service ([3332b31](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/3332b31bfd33ad2643e5b4e5f91ab6e829922c0a))
* Missing assetId on contract call from meritorder. ([2a504b9](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/2a504b954e8acadba29e66b60da383915623b7f3))
* Missing balancing of MOL/contract based transactions. ([2bfddaf](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/2bfddafb56103d8cba653f44686c7f117eb4147b))

## [0.6.0](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.5.6...v0.6.0) (2024-01-25)


### Features

* Adding fulltext search of balancing points to admin ui. ([39ae2ee](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/39ae2ee5ccf121a514fa14348c8d60841de6f198))
* Allow searching for balancing points using partial assetIds ([da6aaf9](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/da6aaf9f22fd604faa200f9f56f7819de66b796e))
* Implement Balancing Group Management with Contract & MeritOrder Services ([62b2ffe](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/62b2ffe856b9305520c9010ae8b7c5dd34a1c2ed))
* Initial implementation of Merit Order List - needs to be triggered by balancing service. Initial implementation of contract service (power purchase agreements) - will give contracts that are used in balancing via merit order list (mol). ([5be6fef](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/5be6fefa7e1c8df84307194f93b5d5fff35a2118))


### Bug Fixes

* adding type in asset search query. ([19d35fa](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/19d35faa5b2b90a69c8dac8bb478fb22d48697aa))
* Missing id parameter handling in case mongodb is used to persist (stateful operation) ([3ccb85a](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/3ccb85a089d528e94b44d581b1975b92aefa552e))
* Putting contract into MOL (replace MOL if already exists). ([c60a444](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/c60a444b8db7797f5980cb10d6880b71e0e30d99))
* Removed typo in meritorder preventing updates of existing MOL ([1ad81c5](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/1ad81c5b43f70e36b16b4f07ba240873711fe72c))

## [0.5.6](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.5.5...v0.5.6) (2024-01-24)


### Features

* CO2 emission visible on admin ui. QR Code for certificate transfer/download of electricity products. ([7b4b7c9](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/7b4b7c987c5c8bd7138aa0ffc90e0e46f183be82))

## [0.5.5](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.5.4...v0.5.5) (2024-01-22)


### Features

* Added carbon accounting support to balancing service (untested). ([0dbb118](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/0dbb11808b314227c7f80abbb4f1752e3c58ca3e))
* Handling CO2eq information if dynamic source provides it. Implemented for the green power index (GSI https://gruenstromindex.de/). Provides actual information for carbon accounting parallel to the energy balancing (not implmented so far). ([f157ee1](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/f157ee10b8bfd7dadd47812a521deeca81fb7311))
* Settlement service handles co2eq information from dynamic pricing source (if available). ([1681678](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/16816781bc107d44634a2c1478a710a09f091a61))


### Bug Fixes

* Added missing co2eq column in tariff model caused settlement to not provide co2eq information to upstream services like loadprofile or balancing. ([b3bdb73](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/b3bdb735c84d22ca95c3fca2caf170f326edf52a))
* Balancing addSettlement and loadprofile requires rounded values for co2eq to prevent floating point operations in downstream processing. ([3ebda96](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/3ebda961b2031d5d8c78b823ca9f5ad18a99e1e1))
* https://github.com/energychain/STROMDAO_EAFs/issues/18 ([d32819d](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/d32819d53560b3f6ae59fc366b978d96d503b52d))
* Missing balance tags for carbon accounting in models ([5f5a70f](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/5f5a70fcb5d57a4e3eb420a7388d8abdc4c2a05b))
* Missing co2eq handling in metering service and readings_model. ([1e4a3fa](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/1e4a3fa56401d1416b7d1d293e70281017715d28))
* Missing search handler for global search in case no meter. ([1e672f8](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/1e672f8c23b92e889a2207d3e4e1469851b7a52f))
* Reworked search handling for free text search and finding in transactions of balancing. ([459b2d9](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/459b2d94d57dc7a7e67172b054e7a2e3a6fa6ca3))

## [0.5.4](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.5.3...v0.5.4) (2024-01-19)


### Features

* `balancing.latestBalances` Returns the top n balances sealed models for a given asset ID. ([c6ade19](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/c6ade19e4dec50668bd8b53f8d3d77b9dd79f480))
* UI Upgrade to match to new balancing concept. Allows to navigate through balances from near history. ([422b6df](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/422b6dfe76075f0b1636521b4ce251d30e4c0014))

## [0.5.3](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.5.2...v0.5.3) (2024-01-19)


### Features

* auto sealing of simple meter reading based addSettlement calls to balancing. ([f4bd29d](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/f4bd29d0b94380089f4c3c9337743c21fb33bde9))
* Re-implemented auto seal. Auto Seal is an optional parameter to the addSettlement method of balancing. The epoch n-value will be automatically sealed. Useful for meter readings - might be used with other balancing points in the future, but not implemented so far. ([93efb97](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/93efb975c9523055d0f7f75c30d467b8dd8c5ec3))


### Bug Fixes

* Add counter partner for closed balances ([983cdd0](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/983cdd0b2ca5752b9c98fae6b879a349d5c1c258))
* Handling of closing booking in energy balancing. ([dafc569](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/dafc5693cb5ff6c29bfaa818f55173fb90996c38))
* Handling of sealed balances. In case addSettlement is performed with a partner having a sealed balance a null will be returned instead of a transaction statement. ([139e252](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/139e25273e1e4db04b1bb08e5d19d4cf94beca4a))
* Missing parameter in counter statement ([99e2984](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/99e298446e4f8e4a3993274d492456e126f13caf))

## [0.5.2](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.5.1...v0.5.2) (2024-01-17)


### Features

* Implementation of sealing of energy balances per product, assetId, epoch. ([d095080](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/d0950809ad3cced7fe43e1efc818c7d20cf16a71))
* Settlements can be added to an electricity product until the balancing for an electricity product is completed (=sealing). If a settlement is to be made after the balancing of the electricity product has already been completed, the process is saved as "postbalancing". ([01c7a54](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/01c7a5481b73288f06d41b1255a576094f335dcd))
* UI integration of balance sealing ([a5fdf50](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/a5fdf50e03d6db0d7c5a9fa80601ab1a963cc8c1))


### Bug Fixes

* Invalid handling for "Einspeiser" in balancing ([970d844](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/970d844f0e6a47f2451bf6b6c7a8b26a23812175))
* Missing field in balancing_model caused sealing not to function as designed. ([056b50c](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/056b50c394554f29940a98e02f3ce29022eafe4f))
* several misspellings in postbalancing model. ([2214b9a](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/2214b9a802de63340323783cf44f6a019302d9c9))
* Typo in variable. ([ea293bb](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/ea293bb581869a71d5406ce7f08a1d11e7798533))

## [0.5.1](https://github.com/energychain/ZSG_DynamischeStromtarife/compare/v0.5.0...v0.5.1) (2024-01-15)


### Features

* Balancing directions added ([ce1a792](https://github.com/energychain/ZSG_DynamischeStromtarife/commit/ce1a7924be408ee9a8483fdc1edec0645a444879))

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
