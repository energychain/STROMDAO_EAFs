
$(document).ready(function() {
    const renderProfile = function(data) {
        let chartDataMeter = [];
        let chartDataProfile = [];
        let chartLabels = [];
        let meterId = '';
        if(typeof data.meterId !== 'undefined') {
            meterId = data.meterId;
        }
        for(let i=0;i<data.settlements.length;i++) {
            
            chartDataMeter.push(data.settlements[i].consumption/1000);
            if(meterId.length > 0) {
                chartDataProfile.push(Math.round(data.settlements[i].consumption_reference*10000)/100);
            } else {
                chartDataProfile.push(Math.round(data.settlements[i].consumption_normalized*10000)/100);
            }
            chartLabels.push(data.settlements[i].epoch_of_day+":00");
        }
        const ctxChart = document.getElementById('profileChart');
        if(typeof window.chartObject !== 'undefined') window.chartObject.destroy();

        let unit = 'kWh';
        if(meterId.length == 0) {
            unit = '%';
        }

        datasets = [{
            label: 'Portfolio Profil %',
            data: chartDataProfile,
            backgroundColor:["#c69006"],
            yAxisID: 'A',
        }];

        if(meterId.length > 0) {
            datasets.push({
                label: 'Lastgang '+meterId + ' kWh',
                data: chartDataMeter,
                backgroundColor:["#147a50"],
                yAxisID: 'B',
            });
        } 

        
        window.chartObject = new Chart(ctxChart, {
            type: 'line',
            data: {
              labels: chartLabels,
              datasets: datasets
            },
            options: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if(typeof context.parsed !== 'undefined') {
                                return context.parsed + ''+unit;
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
                      grid: { display: false }
                    },
                    B: {
                      type: 'linear',
                      position: 'right',
                      ticks: { beginAtZero: true, color: '#147a50' },
                      grid: { display: false }
                    },
                    x: { ticks: { beginAtZero: true } }
                  },
            }
        });
    }

    $('#frmProfile').submit(function(event) {
        event.preventDefault();
        $.getJSON("/api/prediction/epoch_of_day?meterId="+$('#meterId').val()+"", renderProfile); 
    });

    if($.urlParam('meterId')) {
        $('#meterId').val($.urlParam('meterId'));
        $('#frmProfile').submit();
    } else {
        $.getJSON("/api/prediction/epoch_of_day", renderProfile);
    }
    
});