/**
 * Runs a performance test. Requires framework to be started first.
 * 
 */

const number_of_meters = 1000; //number of meters to run test with
const number_of_updates = 10; // number of updates per meter to perform

const axios = require("axios");

const runner = async function() {
    
    // Initialize test meters 
    let meters = [];
    for(let i=0;i<number_of_meters;i++) {
       let meter =   {
                meterId:'benchTest_'+i+"_"+Math.random(),
                time:new Date().getTime() - Math.round((Math.random() * 24 * 3600000)),
                reading: Math.round(Math.random()*100000)
        }
        meters.push(meter);
    }

    // Initialize Update Requests
    let res = null;

    let startTime = new Date().getTime();
    let requests = 0;

    for(let i=0;i<number_of_updates;i++) {
        for(let j=0;j<number_of_meters;j++) {
             meters[j].time += 1 + Math.round(Math.random() * 24 * 3600000);
             meters[j].reading += 1 + Math.round(Math.random()*100000);   
             res = await axios.post("http://localhost:3000/api/metering/updateReading", meters[j]);
             if(!res.data.processed) {
                throw Error("Framework skipped processing!");
             }
             requests++;
        }
    }
    let endTime = new Date().getTime();

    console.log("Performance Test Results");
    console.log("Number of Meter Readings: ",requests);
    console.log("Runtime (ms): ",endTime-startTime);
    console.log("Readings per second: ",requests/(endTime-startTime)*1000);
    console.log("Time per Reading (ms); ",(endTime-startTime)/requests);
}

runner();