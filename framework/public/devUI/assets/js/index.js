$(document).ready(function() {

    const updateMeteringStatistics = async function() {
        $.getJSON("/api/tariff/getPrices", function(tariff) {
            for (const [key, value] of Object.entries(tariff)) {
                if(!isNaN(value)) {
                    $('#price_'+key).html(value.toFixed(4).replace('.',','));
                }
            }
            $.getJSON("/api/statistics/overview?delay=86400000",function(data) {
                data.total = (1* data.delayed) + (1* data.active);
                $('#metersInactive').html(data.delayed);
                $('#metersActive').html(data.active);
                $('#metersTotal').html( data.total );
                $('#metersTotal').attr('data',data.total);
                $('#metersTotalPercentage').html("100 %");
                $('#metersInactivePercentage').html( ((data.delayed/data.total)*100).toFixed(1).replace('.',',')+"%" );
                $('#metersActivePercentage').html( ((data.active/data.total)*100).toFixed(1).replace('.',',')+"%" );
                let totalCost = 0;
                let totalConsumption = 0;

                for (const [key, value] of Object.entries(data.consumptions)) {
                    $('#'+key).html( (value/1000).toFixed(0).replace('.',','));
                    $('#'+key+'Percentage').html( 'kWh ('+ (   (value/data.consumptions.consumption )*100  ).toFixed(1).replace('.',',')+"%)" );
                    const tariffKey = key.replace('consumption_','');
                    if((typeof tariff[tariffKey] !== 'undefined') && (!isNaN(tariff[tariffKey]))) {
                        totalCost += (value/1000) * tariff[tariffKey];
                        totalConsumption += value;
                    }
                }
                
                $('#price').html( ( (totalCost * 1) / (totalConsumption/1000)).toFixed(4).replace('.',',') );
                $('#consumption').attr('data',totalConsumption/1000);
                $('#consumption').html( (totalConsumption/1000).toFixed(0) );
                if(typeof  window.epochData == 'undefined') {
                    updateMeteringPrediction();
                }
            });
        });
    }

    const updateMeteringPrediction = async function() {
    
        const renderPrediction = function(data) {
            window.localStorage.setItem("cache_prediction_x_epochs", JSON.stringify(data));

            if(data.length == 0) {
                $('#predictionDiv').hide();
            } else {
                $('#predictionDiv').show();
            }
            data = data.slice(-24);
            let chartDataActual = [];
            let chartDataPrediction = [];
            let chartLabels = [];
            let chartDataReference = [];
    
            let meterId = '';
            if(typeof data.meterId !== 'undefined') {
                meterId = data.meterId;
            }
            let inPrediction = false;
            for(let i=0;i<data.length;i++) {
                if(data[i].type == 'actual') {
                    chartDataActual.push(data[i].consumption/1000);
                    chartDataPrediction.push(null);
                } else {
                    if(!inPrediction) {
                        chartDataActual.push(data[i].consumption/1000);
                    } else {
                        chartDataActual.push(null);
                    }
                    
                    chartDataPrediction.push(data[i].consumption/1000);
                    inPrediction = true;
                }
                chartDataReference.push(window.epochData["e_"+data[i].epoch_of_day] *  (100)); // removed $('#consumption').attr('data')*
    
                chartLabels.push(data[i].epoch_of_day+":00");
            }

            const ctxChart = document.getElementById('predictionChart');
            if(typeof window.predictionObject !== 'undefined') window.predictionObject.destroy();
    
            let unit = 'kWh';
    
            datasets = [
            {
                label: 'Langzeit Profil',
                data: chartDataReference,
                backgroundColor:["#c69006"],
                yAxisID: 'A',
                fill:false
            },
            {
                label: 'Aktuell',
                data: chartDataActual,
                backgroundColor:["#606060"],
                yAxisID: 'B',
            },
            {
                label: 'Vorhersage',
                data: chartDataPrediction,
                backgroundColor:["#c0c0c0"],
                yAxisID: 'B',
            }
            ];
    
    
            
            window.predictionObject = new Chart(ctxChart, {
                type: 'line',
                data: {
                  labels: chartLabels,
                  datasets: datasets
                },
                options: {
                    fill:true,
                    options: {
                        responsive: true
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if(typeof context.parsed !== 'undefined') {
                                    return context.parsed + 'kWh';
                                } else return '';
                            }
                        }
                    },
                    scales: {
                        A: {
                          type: 'linear',
                          position: 'left',
                          ticks: { beginAtZero: true, color: '#c69006' },
                          // Hide grid lines, otherwise you have separate grid lines for the 2 y axes
                          grid: { display: false },
                          beginAtZero: true
                        }, 
                        B: {
                            type: 'linear',
                            position: 'right',
                            ticks: { beginAtZero: true, color: '#147a50' },
                            // Hide grid lines, otherwise you have separate grid lines for the 2 y axes
                            grid: { display: false },
                            beginAtZero: true
                          },
                        x: { ticks: { beginAtZero: true },beginAtZero: true }
                      },
                }
            });
        }

        const renderProfile = function(data) {
        window.localStorage.setItem("cache_epoch_of_day", JSON.stringify(data));

        let chartDataMeter = [];
        let chartDataProfile = [];
        let chartLabels = [];
        window.epochData = {};

        let meterId = '';
        if(typeof data.meterId !== 'undefined') {
            meterId = data.meterId;
        }
        for(let i=0;i<data.settlements.length;i++) {
            
            chartDataMeter.push(data.settlements[i].consumption/1000);
            chartDataProfile.push(Math.round(data.settlements[i].consumption_normalized*10000)/100);
            window.epochData["e_"+data.settlements[i].epoch_of_day] = data.settlements[i].consumption_normalized *  ($('#metersTotal').attr('data')/100);
           
            chartLabels.push(data.settlements[i].epoch_of_day+":00");

        }
            if((typeof window.localStorage.getItem("cache_prediction_x_epochs") !== 'undefined') && (window.localStorage.getItem("cache_prediction_x_epochs") !== null)) {
                renderPrediction(JSON.parse(window.localStorage.getItem("cache_prediction_x_epochs")));
            }
            $.getJSON("/api/prediction/x_epochs?x=12&predict=6", renderPrediction);
        }
        if((typeof window.localStorage.getItem("cache_epoch_of_day") !== 'undefined') && (window.localStorage.getItem("cache_epoch_of_day") !== null)) {
            renderProfile(JSON.parse(window.localStorage.getItem("cache_epoch_of_day")));
        }

        $.getJSON("/api/tariff/prices", function(data) {
            let chartLabels = [];
            let chartData = [];
            let chartColors = [];
            for(let i=0;i<data.length;i++) {
                let label = new Date(data[i].time).toLocaleString();
                if((i !== 0) && (i !== data.length-1)) {
                    label = new Date(data[i].time).toLocaleTimeString();
                }
                chartLabels.push(label);
                chartData.push(data[i].price);
                let color = '#c0c0c0';
                if(data[i].label == 'virtual_1') color = '#147a50';
                if(data[i].label == 'virtual_2') color = '#c69006';
                if(data[i].label == 'virtual_3') color = '#a0a0a0';
                chartColors.push(color);
            }
            const ctxChart = document.getElementById('forecastChart');
            if(typeof window.chartObject !== 'undefined') window.chartObject.destroy();
    
            window.chartObject = new Chart(ctxChart, {
                type: 'bar',
                data: {
                  labels: chartLabels,
                  datasets: [{
                    label: 'Preis je kWh',
                    data: chartData,
                    backgroundColor:chartColors
                  }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    },
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y.toFixed(2).replace('.',',') + ' €/kWh';
                                }
                            }
                        },
                        legend: {
                            display:false
                        }
                    }
                }
              });
        });
        $.getJSON("/api/prediction/epoch_of_day", renderProfile);
    }
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
        // Add  readings
        let meterReading = Math.round(Math.random() * 100000);
        let meterTime = new Date().getTime();
        await submitReading({
                    meterId: 'demo',
                    reading: meterReading,
                    time: meterTime
        });

        for(let i=0;i<16;i++) {
            meterReading +=  1 +  Math.round(Math.random() * 1000);
            meterTime += 1800000 + Math.round(Math.random() * 3600000);
            await submitReading({
                meterId: 'demo',
                reading: meterReading,
                time: meterTime
            });
        }
        
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
    $.getJSON("/api/readings_model/", function(data) {
       if(data.total == 0) {
            $('#addDemo').removeAttr('disabled');
            $('#addDemo').removeClass("disabled");
        }
    });
    $('#metersInactive').click(function() {
        location.href= '/devUI/uc_assets.html?delay=86400000';
    });
    updateMeteringStatistics();
    setInterval(updateMeteringStatistics, 5*60000);
    setInterval(updateMeteringPrediction,30*60000);

    $('#searchMeter').submit(function(e) {
        e.preventDefault();
        var dataToSend = {
            "$text": { "$search": $('#q').val() } 
          };
          // AJAX POST-Request
          $.ajax({
            type: 'POST',
            url: '/api/asset/find', 
            data: JSON.stringify(dataToSend),
            contentType: 'application/json',
            success: function(response) {
                if(response.length == 1) {
                    location.href="./uc_clearing.html?meterId="+response[0].assetId.substring(6)
                } else {
                    let html = '';
                    for(let i=0;(i<response.length)&&(i<5);i++) {
                        html += '<a class="btn btn-dark btn-sm" role="button" href="./uc_clearing.html?meterId='+response[0].assetId.substring(6)+'" rel="tag">'+response[i].assetId.substring(6)+'</a>';
                    }
                    $('#resultList').html(html);
                }
                
            },
            error: function(error) {
            
            }
    });     
    })
})