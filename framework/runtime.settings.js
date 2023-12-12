const MongoDBAdapter = require("moleculer-db-adapter-mongo");

module.exports = {
    db_adapter: null,  // Use for MondoDB: new MongoDBAdapter("mongodb://HOSTNAME/stromdao_eafs")
    EPOCH_DURATION: 3600000, // Milliseconds of a tariff epoch 
    TARIFF_SEGMENTS: 3, // Number of segments this framework's tariff uses
    AUTO_CLEARING: true, // Performe clearing directly after reading completed
    TARIFF_LABELS: {
        "virtual_1": "Niedertarif",
        "virtual_2": "Mitteltarif",
        "virtual_3": "Hochtarif",
        "virtual_4": "",
        "virtual_5": "",
        "virtual_6": "",
        "virtual_7": "",
        "virtual_8": "",
        "virtual_9": ""
    },
    JWT_SECRET: "******UnbedingtÄndern!******", // Secret for JSON-Web-Tokens 
    JWT_EXPIRE_METERING: '7d', // Token expiration for reading updates
    JWT_EXPIRE_CLEARING: '7d', // Token expiration for clearings
    JWT_EXPIRE_READING: '7d', // Token expiration for processed readings
}