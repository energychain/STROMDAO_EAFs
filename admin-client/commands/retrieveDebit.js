const axios=require("axios");

module.exports = async function(config) {
    if(typeof config.baseUrl == 'undefined') config.baseUrl = "http://localhost:3000";
    if(typeof config.meterId == 'undefined') {
        throw Error("Requires --meterId <meterId>");
    }
    
    const res = await axios.get(config.baseUrl + "/api/debit/open?meterId="+config.meterId);
    return res.data;
}