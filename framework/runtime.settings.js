const MongoDBAdapter = require("moleculer-db-adapter-mongo");
const fs = require("fs");

const runtimeDefaults = {
    db_adapter: null,  // Use for MondoDB: new MongoDBAdapter("mongodb://HOSTNAME/stromdao_eafs")
    EPOCH_DURATION: 3600000, // Milliseconds of a tariff epoch 
    TARIFF_SEGMENTS: 3, // Number of segments this framework's tariff uses
    DEFAULT_SEGMENT: 2, // In case dynamic source does not provide value this segment is used,
    READING_RATE_LIMIT: 3600000/4, // Limit new readings to maximum every x milliseconds
    AUTO_CLEARING: true, // Performe clearing directly after reading completed,
    PORT_API: 3000,
    PORT_METERING: 3001, // Port to listen for metering API request
    PORT_PWA: 3002,
    DYNAMIC_SIGNAL: "../dynamicsignal/gruenstromindex.js",
    TARIFF_LABELS: JSON.stringify({
        "virtual_1": "Niedertarif",
        "virtual_2": "Mitteltarif",
        "virtual_3": "Hochtarif",
        "virtual_4": "",
        "virtual_5": "",
        "virtual_6": "",
        "virtual_7": "",
        "virtual_8": "",
        "virtual_9": ""
    }),
    DEFAULT_PRICING:JSON.stringify([
        {label: 'virtual_1', price: 0.2},
        {label: 'virtual_2', price: 0.3},
        {label: 'virtual_3', price: 0.4},
        {label: 'virtual_4', price: 0.5},
        {label: 'virtual_5', price: 0.6},
        {label: 'virtual_6', price: 0.7},
        {label: 'virtual_7', price:0.1},
        {label: 'virtual_8', price:9.99},
        {label: 'virtual_9', price:9.99} 
    ]),
    JWT_OPTIONS: JSON.stringify({
        issuer:  "Stadtwerk Musterstadt",
        subject:  "EAF",
        audience:  "https://tariff.stadtwerk-musterstadt.de",
        algorithm:  "RS256"
       }),
    JWT_EXPIRE_METERING: '7d', // Token expiration for reading updates: 
    JWT_EXPIRE_CLEARING: '7d', // Token expiration for clearings
    JWT_EXPIRE_READING: '7d', // Token expiration for processed readings
    ACTIVATIONMULTIUSE: "true", // Allow Multi use of meter reading activation codes
    MOLECULAR_LAB_KEY:process.env.MOLECULAR_LAB_KEY,
    DEFAULTS_LOADED:new Date().getTime(),
    TRANSPORTER: ""
}

// Fallback for pre 0.2.43 releases
let keysFolderLocation = "./keys/";

if((typeof process.env["EAF_WORK"] == 'undefined')||(process.env["EAF_WORK"] == 'null')) { 
    require('dotenv').config();
} else {
    keysFolderLocation = process.env["EAF_WORK"]+"/keys/";
}

// Extended Key Management
/*
  Should allow Docker users to just copy from ./keys/ folder of existing other NODE.
*/
if(!fs.existsSync(keysFolderLocation)) {
    fs.mkdirSync(keysFolderLocation);
}

if((typeof process.env["EAF_KEYS"] !== 'undefined')&&(process.env["EAF_KEYS"] !== 'null')) { 
    fs.copyFileSync(process.env["EAF_KEYS"]+"/runtime.privateKey.pem", keysFolderLocation +"runtime.privateKey.pem");
    fs.copyFileSync(process.env["EAF_KEYS"]+"/runtime.publicKey.pem", keysFolderLocation + "runtime.publicKey.pem"); 
}

try {
    if(fs.existsSync(keysFolderLocation+ "runtime.privateKey.pem") == false) {
        const crypto = require('crypto');

        // Generate a new 2048-bit RSA key pair
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        });

        // Save the public key to a file
        fs.writeFileSync(keysFolderLocation + 'runtime.publicKey.pem', publicKey.export({ format: 'pem', type: 'pkcs1' }));

        // Save the private key to a file
        fs.writeFileSync( keysFolderLocation + 'runtime.privateKey.pem', privateKey.export({ format: 'pem', type: 'pkcs1' }));
    }
} catch(e) {
    console.error("E01 - Key Persistance",e);
}

// Set Keys in default runtime
try {
    runtimeDefaults.JWT_PRIVATEKEY = fs.readFileSync(keysFolderLocation + "runtime.privateKey.pem");
    runtimeDefaults.JWT_PUBLICKEY = fs.readFileSync(keysFolderLocation + "runtime.publicKey.pem");
} catch(e) {
    console.error("E02 - Runtime Keys",e);
}

module.exports = function(overwrites) {
    
    if(typeof process.env.DEFAULTS_LOADED == 'undefined') {
        for (const [key, value] of Object.entries(runtimeDefaults)) {
            if(typeof process.env[key] == 'undefined') {
                process.env[key] = value;
            }
        }
    }
    if((typeof overwrites !== 'undefined') && (overwrites !== null)) {
        for (const [key, value] of Object.entries(overwrites)) {
            process.env[key] = value;
        }
    }

    if((typeof process.env["db_adapter"] == 'undefined')||(process.env["db_adapter"] == 'null')) { //Fix #8
        delete process.env["db_adapter"];
        process.db_adapter = null;
    } else {
        process.db_adapter = new MongoDBAdapter(process.env["db_adapter"],{
            poolSize: 100,
            wtimeout: 2500,
            connectTimeoutMS: 10000,
        });
    }
   
    return process.env;
}
