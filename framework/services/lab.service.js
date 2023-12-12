// lab.service.js
const Laboratory = require("@moleculer/lab");

module.exports = {
    mixins: [Laboratory.AgentService],
    settings: {
        token: "NeedToBeSetForSecurity",
        apiKey: require("../runtime.settings.js").MOLECULAR_LAB_KEY
    }
};