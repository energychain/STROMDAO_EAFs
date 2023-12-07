const MongoDBAdapter = require("moleculer-db-adapter-mongo");

module.exports = {
    db_adapter: null,  // Use for MondoDB: new MongoDBAdapter("mongodb://HOSTNAME/stromdao_eafs")
    EPOCH_DURATION: 3600000, // Milliseconds of a tariff epoch 
    TARIFF_SEGMENTS: 3, // Number of segments this framework's tariff uses
    AUTO_CLEARING: true // Performe clearing directly after reading completed
}