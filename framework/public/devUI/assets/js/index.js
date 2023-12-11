$(document).ready(function() {
    const step3 = async function() {
        const submitReading = function(reading) {
            return new Promise(function(resolve, reject) {
                $.ajax({
                    type: 'POST',
                    url: '/api/metering/updateReading', 
                    data: JSON.stringify(reading),
                    contentType: 'application/json',
                    success: function(response) {
                      // Erfolgreiche Antwort vom Server
                        resolve();
                    },
                    error: function(error) {
                        reject();
                    }
                });     
            })
        }
        // Add three readings
        let meterReading = Math.round(Math.random() * 100000);
        let meterTime = new Date().getTime() - (86400000);
        await submitReading({
                    meterId: 'demo',
                    reading: meterReading,
                    time: meterTime
        });

        meterReading +=  1 +  Math.round(Math.random() * 1000);
        meterTime += 1 + Math.round(Math.random() * 4 * 3600000);
        await submitReading({
            meterId: 'demo',
            reading: meterReading,
            time: meterTime
        });

        meterReading +=  1 +  Math.round(Math.random() * 1000);
        meterTime += 1 + Math.round(Math.random() * 4 * 3600000);
        await submitReading({
            meterId: 'demo',
            reading: meterReading,
            time: meterTime
        });

        meterReading +=  1 +  Math.round(Math.random() * 1000);
        meterTime += 1 + Math.round(Math.random() * 4 * 3600000);
        await submitReading({
            meterId: 'demo',
            reading: meterReading,
            time: meterTime
        });
        
        location.reload();
    }

    $('#addDemo').on('click',function() {
            $('#addDemo').attr('disabled');
            // Step 1: Get Backend custom Labels
            let customLabels = {};

            $.getJSON("/api/tariff/customLabels", function(data) {
                customLabels = data;
                // Step 2: Setup Tariffs
                var dataToSend = {};
                let lastPrice = 0.2;

                for (const [key, value] of Object.entries(customLabels)) {
                    dataToSend[key] = lastPrice;
                    lastPrice += 0.1;
                }
                $.ajax({
                    type: 'POST',
                    url: '/api/tariff/setPrices', 
                    data: JSON.stringify(dataToSend),
                    contentType: 'application/json',
                    success: function(response) {
                        // Continue with step3
                        step3();
                    },
                    error: function(error) {
                        console.error(error);
                    }
                });  
        });
    });

    // Test if system already has data - if so do not enable button
    $.getJSON("/api/readings/", function(data) {
       if(data.total == 0) {
            $('#addDemo').removeAttr('disabled');
            $('#addDemo').removeClass("disabled");
        }
    });
})