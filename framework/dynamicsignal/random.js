module.exports =  function(params) {
    const TARIFF_SEGMENTS = require("../runtime.settings.js").TARIFF_SEGMENTS;

    return {
        lookup: async function(epoch) {
             return {
                epoch: epoch,
                label: "virtual_"+(Math.floor(Math.random() * TARIFF_SEGMENTS) + 1)
             }  
        }
    };
    
}
  