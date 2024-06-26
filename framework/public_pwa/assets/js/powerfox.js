if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(
      '/assets/js/3party/sw.js'
    );
}

const app = async function(token) {
    $('.appcontent').show();
    let minY=99999;
    $.getJSON("/api/tariff/prices?token="+token, function(data) {
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
            if(data[i].price < minY) minY = data[i].price;
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
                        min: minY * 0.8
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
                    },
                    datalabels: {
                        display: false,
                    }
                }
            }
          });
    });
    let crossbalance = '';

    if($.urlParam("crossbalance") || window.crossbalance) {
        console.log("Doing Crossbalanced Retrieve");
        crossbalance = '&crossbalance='+$.urlParam("crossbalance");
    }
    $.getJSON("/api/debit/open?meterId="+window.meterId+"&token="+token+crossbalance, function(data) {
        let totalConsumption = 0;

        // Handling "Abrechnung Übersicht in Zeile"
        for (let [key, value] of Object.entries(data)) {
            if(key.indexOf('cost') == 0) {
                $('.'+key).html(value.toFixed(2).replace('.',','));
            }
            if(key.indexOf('consumption_') == 0) {
                $('.'+key).html((value/1000).toFixed(3).replace('.',','));
                totalConsumption += value * 1;
            }
        }
        $('.consumption').html((data.consumption/1000).toFixed(3).replace('.',','));
        $('.cost').html(data.cost.toFixed(2).replace('.',','));

        const ctxCostChart = document.getElementById('costChart');
        if(typeof window.costChartObject !== 'undefined') window.costChartObject.destroy();
        Chart.register(ChartDataLabels);
        window.costChartObject = new Chart(ctxCostChart,{
            type: 'doughnut',
            data: {
                labels: ["Niedertarif", "Mitteltarif", "Hochtarif"],
                datasets: [{
                    label: 'Kosten',
                    data: [data["cost_virtual_1"], data["cost_virtual_2"], data["cost_virtual_3"]],
                    backgroundColor: ["#147a50", "#c69006", "#a0a0a0"],
                }]
            },
            options: {
                animation: false,
                plugins: {
                    datalabels: {
                        display: true,
                        color: 'black',
                        anchor: 'center',
                        font: {
                            size: 20,
                            weight: 'bold'
                        },
                        formatter: function(value) {
                            return Math.round(value/data.cost*100) + '%';
                        }
                    }
                }
            }
        });

        const ctxConsumptionChart = document.getElementById('consumptionChart');
        if(typeof window.consumptionChartObject !== 'undefined') window.consumptionChartObject.destroy();

        window.consumptionChartObject = new Chart(ctxConsumptionChart, {
            type: 'doughnut',
            label: 'Verbrauch',
            data: {
              labels: ["Niedertarif","Mitteltarif","Hochtarif"],
              datasets: [{
                label: 'Verbrauch',
                data: [data["consumption_virtual_1"],data["consumption_virtual_2"],data["consumption_virtual_3"]],
                backgroundColor:["#147a50","#c69006","#a0a0a0"]
              }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if(typeof context.parsed !== 'undefined') { 
                                 return (context.parsed/1000).toFixed(3).replace('.',',') + ' kWh';
                                } else return '';
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        color: 'black',
                        anchor: 'center',
                        font: {
                            size: 20,
                            weight: 'bold'
                        },
                        formatter: (value) => {
                            return Math.round(value/totalConsumption*100) + '%';
                        },
                    }
                }
            }
        });
    });

    $.getJSON("/api/clearing/retrieve?meterId="+window.meterId+"&token="+token+crossbalance, function(data) {
        let aggregationCost = {};
        let aggregationConsumption = {};
        let totalConsumption =  0;
        let totalCost = 0;
        let consumptionChart = [];
        let costChart = [];
        let oldEpoch  = -1;
        let timeSpan = Math.abs(data[0].endTime - data[data.length - 1].endTime);

        for(let i=0;i<data.length;i++) {
            for (let [key, value] of Object.entries(data[i])) {
                if(key.indexOf("consumption_virtual") == 0) {
                    if(typeof aggregationConsumption[key] == 'undefined') aggregationConsumption[key] = 0;
                    aggregationConsumption[key] += value;
                }
                if(key.indexOf("cost_virtual") == 0) {
                    if(typeof aggregationCost[key] == 'undefined') aggregationCost[key] = 0;
                    aggregationCost[key] += value;
                }
                if(key == 'cost') totalCost += value;
                if(key == 'consumption') totalConsumption += value;
            }
            let epoch = Math.floor(new Date(data[i].endTime).getTime()/3600000);
            if((epoch !== oldEpoch) && (data[i]["consumption"]!==0)) {
                consumptionChart.push({
                    x:epoch,
                    y:data[i]["consumption"]
                });
                costChart.push({
                    x:epoch,
                    y:data[i]["cost"]
                });
                oldEpoch = epoch;
            }
        }
        totalConsumption = 0;

        for (let [key, value] of Object.entries(aggregationConsumption)) {
            totalConsumption += 1 * value;
        }
       
        function interPolateChartArray(inputArray) {
            inputArray.reverse();
            function interpolateY(point1, point2, xValue) {
                const x1 = point1.x;
                const y1 = point1.y;
                const x2 = point2.x;
                const y2 = point2.y;
              
                // Lineare Interpolation
                const yValue = y1 + ((xValue - x1) / (x2 - x1)) * (y2 - y1);
                return yValue;
              }
              
              // Neuen Array erstellen mit allen Ganzzahlen für x
              const newArray = [];
              for (let i = 0; i < inputArray.length - 1; i++) {
                const point1 = inputArray[i];
                const point2 = inputArray[i + 1];
              
                // Iteriere über alle Ganzzahlen zwischen x-Werten von point1 und point2
                for (let x = Math.ceil(point1.x); x < point2.x; x++) {
                  const interpolatedY = interpolateY(point1, point2, x);
                  newArray.push({ x, y: interpolatedY });
                }
              }
              
              // Füge den letzten Punkt des Eingabe-Arrays hinzu
              newArray.push(inputArray[inputArray.length - 1]);
            return newArray;
        }
        consumptionChart = interPolateChartArray(consumptionChart);
        costChart = interPolateChartArray(costChart);

        const ctxTimelineChart = document.getElementById('timeline');
        if(typeof window.timelineChartObject !== 'undefined') window.timelineChartObject.destroy();
        let demofy = 0;
        if(window.meterId == 'demo') demofy = 86400000;

        const xValues = consumptionChart.map(point => new Date( (point.x * 3600000)-demofy ).toLocaleString());
        const yValues = consumptionChart.map(point => (point.y/1000));
        const yValues2 = costChart.map(point => point.y);

        window.timelineChartObject = new Chart(ctxTimelineChart, {
            type: 'line',
            data: {
                    labels: xValues, // x-Werte als Labels
                    datasets: [{
                        label: 'kWh',
                        yAxisID: 'A',
                        data: yValues, // y-Werte für die Datenpunkte
                        borderWidth: 1,
                        backgroundColor: '#273469',
                        borderColor: '#273469',
                        tension: 0.1 // Glättung der Linie
                    },{
                        label: '€',
                        yAxisID: 'B',
                        data: yValues2, // y-Werte für die Datenpunkte
                        borderWidth: 1,
                        backgroundColor: '#606060',
                        borderColor: '#606060',
                        tension: 0.1 // Glättung der Linie
                    }]
            },
            options: {
                responsive: true,
                scales: {
                  A: {
                    type: 'linear',
                    position: 'left',
                    ticks: { beginAtZero: true, color: '#273469' },
                    // Hide grid lines, otherwise you have separate grid lines for the 2 y axes
                    grid: { display: false }
                  },
                  B: {
                    type: 'linear',
                    position: 'right',
                    ticks: { beginAtZero: true, color: '#606060' },
                    grid: { display: false }
                  },
                  x: { ticks: { beginAtZero: true } }
                },
                plugins: {
                    zoom: {
                        pan: {
                            mode: 'x',
                            enabled: true
                        },
                        zoom: {
                            wheel: {
                              enabled: true,
                            },
                            pinch: {
                              enabled: true
                            },
                            mode: 'x',
                          }
                    },
                    datalabels: {
                        display: false,
                    }
                }
               
              }
        });
        setTimeout(function() {
            window.timelineChartObject.zoom( 2-(1/(timeSpan/86400000)) );
            setTimeout(function() {
                window.timelineChartObject.pan({x: -timeSpan});
            },100);
        },500);

        // prepare Stats
        let htmlCost = '<table class="table table-condensed">';
        htmlCost += '<tr><td>&#8960; Preis je kWh</td><td>'+(totalCost/(totalConsumption/1000)).toFixed(3).replace('.',',')+'€</td></tr>';
        htmlCost += '<tr><td>&#8960; Kosten je Tag</td><td>'+(totalCost/(timeSpan/86400000)).toFixed(2).replace('.',',')+'€</td></tr>';
        htmlCost += '<tr><td>&#8960; Kosten je Monat</td><td>'+(totalCost/(timeSpan/(30*86400000))).toFixed(2).replace('.',',')+'€</td></tr>';
        htmlCost += '</table>';
        $('#statsCost').html(htmlCost);

        let htmlConsumption = '<table class="table table-condensed">';
        htmlConsumption += '<tr><td>&#8960; kWh je Euro</td><td>'+((totalConsumption/1000)/totalCost).toFixed(1).replace('.',',')+'</td></tr>';
        htmlConsumption += '<tr><td>&#8960; kWh je Tag</td><td>'+((totalConsumption/1000)/(timeSpan/86400000)).toFixed(1).replace('.',',')+'</td></tr>';
        htmlConsumption += '<tr><td>&#8960; kWh je Monat</td><td>'+((totalConsumption/1000)/(timeSpan/(30*86400000))).toFixed(1).replace('.',',')+'</td></tr>';
        htmlConsumption += '</table>';
        $('#statsConsumption').html(htmlConsumption);
    });

    $.getJSON("/api/access/settings?meterId="+window.meterId+"&token="+token, function(data) {
        for (const [key, value] of Object.entries(data)) { 
            $(".meta_value_"+key).html(value);
            $(".meta_visibility_"+key).show();
        }
    })

    $.getJSON("/api/access/getAssetMeta?meterId="+window.meterId+"&token="+token, function(data) {
        if(typeof data.balancerule !== 'undefined') {
            if(typeof data.balancerule.to !== 'undefined') {
                $('.kosten').html("Einnahmen");
                $('.verbrauch').html("Einspeisung");
            }
        }
        let customName = window.meterId;
        if(typeof data.operationMeta !== 'undefined') {
            if(typeof data.operationMeta.meterPointName !== 'undefined') {
                customName = data.operationMeta.meterPointName;
            }
            for (const [key, value] of Object.entries(data.operationMeta)) { 
                $(".meta_value_"+key).html(value);
                $(".meta_visibility_"+key).show();
            }
        }
        if(typeof data.crossbalance !== 'undefined') {
            $('.viewSelection').show();
        }
        if(typeof data.clientMeta !== 'undefined') {
            if(typeof data.clientMeta.meterPointName !== 'undefined') {
                customName = data.clientMeta.meterPointName;
            }
            for (const [key, value] of Object.entries(data.clientMeta)) { 
                console.debug(".meta_value_"+key,value);
                $(".meta_value_"+key).html(value);
                $(".meta_visibility_"+key).show();
            }
        }

        $('#meterPointName').html(customName);
        $('.editable').editable().on('editsubmit', function (event, val) {
            let dataToSend = {
                token: token,
                meterId: window.meterId
            }
            dataToSend[event.currentTarget.id] = val;

            $.ajax({
                type: 'POST',
                url: '/api/access/updateAssetMeta', 
                data: JSON.stringify(dataToSend),
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer '+token);
                },
                contentType: 'application/json',
                success: function(response) {
                  console.log(response);
                },
                error: function(error) {
                  console.error(error);
                }
            });     
        });
    });
}

$(document).ready(function() {
    $.urlParam = function (name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                          .exec(window.location.search);
    
        return (results !== null) ? results[1] || 0 : false;
    }
    
    $('#meterId').val(window.localStorage.getItem("meterId"));
    $('#token').val(window.localStorage.getItem("token"));
    if($.urlParam('token')) {
        $('#loginModal').modal('hide');
        $('#token').val($.urlParam('token'));
        $('#meterId').val($.urlParam('meterId'));
        window.meterId = $('#meterId').val();
        app($.urlParam('token'));
        $('#loginModal').modal('hide');
    } else {
        $('#loginModal').modal('show');
    }
    if($.urlParam("crossbalance")) {
        window.crossbalance = $.urlParam("crossbalance");
    } 

    $(".viewSelect").click(function() {
        if($(this).val() == "prosumer") {
            window.crossbalance = true;
        } else {
            delete window.crossbalance;
        }
        app($.urlParam('token'));
    });

    $('#loginForm').submit(function(e) {
        e.preventDefault();

        $.ajax({
            type: 'POST',
            url: '/api/powerfox/login', // replace with your endpoint URL
            data: JSON.stringify({ email: $('#email').val(), password: $('#password').val()}), // replace with your data
            contentType: 'application/json',
            success: function(response) {
                if(typeof response.token !== 'undefined') {
                    const token = response.token;
                    const meterId = response.meterId;
                    window.localStorage.setItem("token", token);
                    window.localStorage.setItem("meterId", meterId);
                    $('#meterId').val(meterId);
                    $('#token').val(token);
                    window.meterId = meterId;
                    location.replace("/?token="+token+"&meterId="+meterId);
                    /* For the moment we redirect to the standard login page as this might be the best option to avoid double implementation
                    app(token);
                    // Trigger Auto-Reload
                    setInterval(function() { app(token) }, 60000);
                    $('#loginModal').modal('hide');
                    //
                    */
                } else {
                    console.error("Error login in");
                }
               
            },
            error: function(error) {
                console.error(error);
            }
        });
    })



})