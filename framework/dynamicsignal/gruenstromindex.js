const axios = require("axios");

/**
 * Nutzung des [GrünstromIndex](https://gruenstromindex.de) als dynamisches Preissignal.
 * 
 * Der GrunstromIndex kann von der [Corrently API](https://api.corrently.io/v2.0/gsi/prediction?zip=69256) abgerufen werden.
 * 
 * Die Vorhersage des GrünstromIndex wird nach dem IndexWert sortiert und im Anschluss auf Basis der Anzahl der vorhandenen Tarifsegmente unterteilt.
 *   
 * @param {*} params 
 * @returns 
 */

module.exports =  function(params) {
    const TARIFF_SEGMENTS = JSON.parse(process.env.TARIFF_SEGMENTS);
    const EPOCH_DURATION = process.env.EPOCH_DURATION;

    let gsiCache = null;
    let epochData = {};
    let epochCO2 = {};

    return {
        lookup: async function(epoch) {
            const fetcher = async function() {
                let gsiResponds = await axios.get("https://api.corrently.io/v2.0/gsi/prediction?zip=69256");
                gsiCache = gsiResponds.data.forecast;
                gsiCache.sort((a,b) => b.gsi - a.gsi);

                for(let i=0;i<gsiCache.length;i++) {
                    gsiCache[i].label = Math.floor((i/gsiCache.length)*TARIFF_SEGMENTS)+1;
                    epochData["epoch_"+Math.floor(gsiCache[i].timeStamp/EPOCH_DURATION)] = gsiCache[i].label;
                    epochCO2["epoch_"+Math.floor(gsiCache[i].timeStamp/EPOCH_DURATION)] = gsiCache[i].co2_g_oekostrom;
                }
            }
            if((gsiCache == null) || (typeof epochData["epoch_"+epoch] == 'undefined')) {
                await fetcher();                
            }
            
            let segment = JSON.parse(process.env.DEFAULT_SEGMENT);
            let co2eq = 35/1000;
            if(typeof epochData["epoch_"+epoch] !== 'undefined') {
                segment = epochData["epoch_"+epoch];
                co2eq = epochCO2["epoch_"+epoch];
            }
            return {
                epoch: epoch,
                label: "virtual_"+segment,
                co2eq: co2eq
            }  
        }
    };
    
}
  