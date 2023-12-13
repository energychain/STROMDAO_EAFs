$(document).ready(function() {
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
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y.toFixed(2).replace('.',',') + ' €/kWh';
                            }
                        }
                    }
                }
            }
          });
    });
    $.getJSON("/api/clearing/retrieve?meterId=demo", function(data) {
        let aggregationCost = {};
        let aggregationConsumption = {};
        let totalConsumption =  0;
        let totalCost = 0;
        let consumptionChart = [];
        let costChart = [];
        let oldEpoch  = -1;

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
            if((epoch !== oldEpoch) && (data[i]["consumption"]>0)) {
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

        const xValues = consumptionChart.map(point => new Date(point.x * 3600000).toLocaleString());
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
                }
              }
        });

        for (let [key, value] of Object.entries(aggregationCost)) {
            $('#'+key).html(value.toFixed(2).replace('.',','));
        }
        for (let [key, value] of Object.entries(aggregationConsumption)) {
            $('#'+key).html((value/1000).toFixed(3).replace('.',','));
        }
        $('#consumption').html((totalConsumption/1000).toFixed(3).replace('.',','));
        $('#cost').html(totalCost.toFixed(2).replace('.',','));

        const ctxCostChart = document.getElementById('costChart');
        if(typeof window.costChartObject !== 'undefined') window.costChartObject.destroy();

        window.costChartObject = new Chart(ctxCostChart, {
            type: 'doughnut',
            label: 'Kosten',
            data: {
              labels: ["Niedertarif","Mitteltarif","Hochtarif"],
              datasets: [{
                label: 'Kosten',
                data: [aggregationCost["cost_virtual_1"],aggregationCost["cost_virtual_2"],aggregationCost["cost_virtual_3"]],
                backgroundColor:["#147a50","#c69006","#a0a0a0"]
              }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if(typeof context.parsed !== 'undefined') {
                                    return context.parsed.toFixed(2).replace('.',',') + ' € / '+Math.round(context.parsed/totalCost*100) + '%';
                                } else return '';
                            }
                        }
                    },
                    legend: {
                        display:false
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
                data: [aggregationConsumption["consumption_virtual_1"],aggregationConsumption["consumption_virtual_2"],aggregationConsumption["consumption_virtual_3"]],
                backgroundColor:["#147a50","#c69006","#a0a0a0"]
              }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if(typeof context.parsed !== 'undefined') { 
                                 return (context.parsed/1000).toFixed(3).replace('.',',') + ' kWh / '+Math.round(context.parsed/totalConsumption*100) + '%';
                                } else return '';
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
})