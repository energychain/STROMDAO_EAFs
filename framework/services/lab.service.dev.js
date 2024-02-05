// lab.service.js
const Laboratory = require("@moleculer/lab");

module.exports = {
    mixins: [Laboratory.AgentService],
    settings: {
        token: "NeedToBeSetForSecurity",
        apiKey: process.env.MOLECULAR_LAB_KEY
    }
};