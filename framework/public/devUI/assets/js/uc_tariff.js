$(document).ready(function () {
    const doFetch = function() {
        $.getJSON("/api/tariff/prices?startTime="+new Date($('#time').val()+"Z").getTime(), function(data) {
            let html = '<table class="table table-condensed table-striped">';
            let chartData = [];
            let chartLabels = [];
            for(let i=0;i<data.length;i++) {
                    let displayLabel = data[i].label;
                    if(typeof customLabels[data[i].label] !== 'undefined') {
                        displayLabel = customLabels[data[i].label];
                    }
                    html += '<tr><td>'+new Date(data[i].time).toLocaleString()+'</td><td>'+displayLabel+'</td></tr>';
                    chartData.push(data[i].price);
                    chartLabels.push(new Date(data[i].time).toLocaleString());
            }
            html += '</table>';
            $('#tariffsBackend').html(html);
            $('#tariffsBackend').show();
            // Charting
            const ctxChart = document.getElementById('tariffLabelsChart');
            if(typeof window.chartObject !== 'undefined') window.chartObject.destroy();

            window.chartObject = new Chart(ctxChart, {
                type: 'bar',
                data: {
                  labels: chartLabels,
                  datasets: [{
                    label: 'Preis je kWh',
                    data: chartData
                  }]
                },
                options: {
                }
              });
        })
    }

    $('#time').val(new Date(new Date().getTime()).toISOString().substring(0,16));
    let customLabels = {};

    $.getJSON("/api/tariff/customLabels", function(data) {
        customLabels = data;
        doFetch();
        let html = '<div id="nextChangeLabel"></div>';       
        for (const [key, value] of Object.entries(data)) {
            html += '<div class="input-group" style="margin-bottom: 15px;">';
            html += '<span class="input-group-text col-3">'+value+'</span>';
            html += '<input class="form-control" type="number" step="0.0001" min="0.01" name="'+key+'"  id="'+key+'" required/>';
            html += '</div>';
        }
        $('#tariffPrices').html(html);
        $.getJSON("/api/tariff/getPrices", function(data) {
            if(typeof data.nextChange !== 'undefined') {
                $('#nextChangeLabel').html('<div class="alert alert-warning" role="alert"><span><strong>Geplante Änderung</strong> gültig ab '+new Date(data.nextChange.fromTime).toLocaleString()+'</span></div>');
                $('#fromTime').val(new Date(data.nextChange.fromTime).toISOString().substring(0,16));
                data = data.nextChange;
            } else {
                $('#nextChangeLabel').html("");
            }
            for (const [key, value] of Object.entries(data)) {
                if(key !== 'fromTime') {
                    $('#'+key).val(value);
                } else {
                    $('#'+key).val( (new Date(value).toISOString().substring(0,11))+"00:00");
                }
            }
        });
        const d = (new Date(new Date().getTime()+(1*86400000)).toISOString()).substring(0,11)+"00:00";
        $('#fromTime').val(d);
    });

    $('#frmPrices').submit(function(event) {
        event.preventDefault();
        var dataToSend = {};
        for (const [key, value] of Object.entries(customLabels)) {
            dataToSend[key] = 1 * $('#'+key).val()
        }
        dataToSend.fromTime = new Date($('#fromTime').val()+"Z").getTime();
        $.ajax({
            type: 'POST',
            url: '/api/tariff/setPrices', 
            data: JSON.stringify(dataToSend),
            contentType: 'application/json',
            success: function(response) {
                 console.log(response);
            },
            error: function(error) {
                console.error(error);
            }
        });   
    });

    $('#fetchLabels').submit(function (event) {
        event.preventDefault();
        doFetch();
    });
});