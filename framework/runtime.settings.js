const MongoDBAdapter = require("moleculer-db-adapter-mongo");
const fs = require("fs");
require('dotenv').config();

module.exports = {
    db_adapter: null,  // Use for MondoDB: new MongoDBAdapter("mongodb://HOSTNAME/stromdao_eafs")
    EPOCH_DURATION: 3600000, // Milliseconds of a tariff epoch 
    TARIFF_SEGMENTS: 3, // Number of segments this framework's tariff uses
    DEFAULT_SEGMENT: 2, // In case dynamic source does not provide value this segment is used
    AUTO_CLEARING: true, // Performe clearing directly after reading completed
    DYNAMIC_SIGNAL: "../dynamicsignal/gruenstromindex.js",
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
    DEFAULT_PRICING: [
        {label: 'virtual_1', price: 0.2},
        {label: 'virtual_2', price: 0.3},
        {label: 'virtual_3', price: 0.4},
        {label: 'virtual_4', price: 0.5},
        {label: 'virtual_5', price: 0.6},
        {label: 'virtual_6', price: 0.7},
        {label: 'virtual_7', price:0.1},
        {label: 'virtual_8', price:9.99},
        {label: 'virtual_9', price:9.99} 
    ],
    JWT_PRIVATEKEY: fs.readFileSync("./runtime.privateKey.pem"), // Private Key - Regenerate Keypair with 'openssl genrsa -out runtime.privateKey.pem 2048' 
    JWT_PUBLICKEY: fs.readFileSync("./runtime.publicKey.pem"), // Public Key - Regenerate Keypair with 'openssl genrsa -out runtime.privateKey.pem 2048' 
    JWT_OPTIONS: {
        issuer:  "Stadtwerk Musterstadt",
        subject:  "EAF",
        audience:  "https://tariff.stadtwerk-musterstadt.de",
        algorithm:  "RS256"
       },
    JWT_EXPIRE_METERING: '7d', // Token expiration for reading updates
    JWT_EXPIRE_CLEARING: '7d', // Token expiration for clearings
    JWT_EXPIRE_READING: '7d', // Token expiration for processed readings
    MOLECULAR_LAB_KEY:process.env.MOLECULAR_LAB_KEY
}