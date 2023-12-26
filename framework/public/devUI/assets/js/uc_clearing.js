$(document).ready(function () {
    let customLabels = {};

    $.getJSON("/api/tariff/customLabels", function(data) {
        customLabels = data;
        if($.urlParam('meterId')) {
            $('#meterId').val($.urlParam('meterId'));
            $('#retrieveClearing').submit();
        }
    });

    $('#retrieveClearing').submit(function(e) {
        e.preventDefault();

        $.getJSON("/api/clearing/retrieve?meterId="+$('#meterId').val(), function(data) {
            let costAggregation = {};
            let consumptionAggregation = {};
            let costTotal = 0;
            let consumptionTotal = 0;

            for (const [key, value] of Object.entries(customLabels)) {
                costAggregation[key] = 0;
                consumptionAggregation[key] = 0;
            }
            
            let html_clearings = '<h2>Einzelaufstellung</h2><div class="row">';
            html_clearings += '<div class="col-3"><h3 class="float-end">Verbrauch</h3></div>';
            html_clearings += '<div class="col-7"><h3>Beschreibung</h3></div>';
            html_clearings += '<div class="col-2"><h3>Kosten</h3></div>';
            html_clearings += '</div>';
            for(let i=0;i<data.length;i++) {
                consumptionTotal += 1 * data[i].consumption;
                html_clearings += '<div class="row" style="margin-bottom: 15px;">';
                html_clearings += '<div class="col-3">';
                html_clearings += '<h3 class="float-end">' + (data[i].consumption/1000).toFixed(3).replace('.',',') + '&nbsp;kWh</h3>';
                html_clearings += '</div>';
                html_clearings += '<div class="col-7">'
                html_clearings += '<h3>' + new Date(data[i].endTime).toLocaleString() + '</h3>';
                html_clearings += '<span class="text-muted">Zählerstand: ' + (data[i].reading/1000).toFixed(3).replace('.',',')+"&nbsp;kWh</span>";
                html_clearings += '</div>';
                html_clearings += '<div class="col-2">';
                if((typeof data[i].cost !== 'undefined') &&  (data[i].cost !== null)) {
                    html_clearings += '<h3>'+  data[i].cost.toFixed(2).replace('.',',')+'&nbsp;€</h3>'; 
                    costTotal += data[i].cost;
                }
                html_clearings += '</div>';
                html_clearings += '</div>';

                for (const [key, value] of Object.entries(customLabels)) {
                    if(!isNaN(data[i]["consumption_"+key])) consumptionAggregation[key] += data[i]["consumption_"+key];
                    if(!isNaN(data[i]["cost_"+key])) costAggregation[key] += data[i]["cost_"+key];

                    html_clearings += '<div class="row">';
                    html_clearings += '<div class="col-1">&nbsp;</div>';
                    html_clearings += '<div class="col-2"><strong class="float-end">'+(data[i]["consumption_"+key]/1000).toFixed(3).replace('.',',')+"&nbsp;kWh&nbsp;</strong></div>";
                    html_clearings += '<div class="col-6">'+value+'</div>';
                    if((typeof data[i]["cost_"+key] !== 'undefined' ) && (data[i]["cost_"+key] !== null)) {
                        html_clearings += '<div class="col-2"><strong class="float-end">'+data[i]["cost_"+key].toFixed(2).replace('.',',')+'&nbsp;€</strong></div>';
                    }
                    html_clearings += '</div>';
                }
                html_clearings += '<div stlye="margin-bottom: 30px;">&nbsp;</div>';
            }
            let html_aggregation = '<div class="row" style="margin-bottom:30px;">';

             
                html_aggregation += '<div class="col-4">';
                html_aggregation +=  '<div class="card h-100">';
                 html_aggregation += '<div class="card-header">';
                    html_aggregation+='<h3>Verbrauch: '+ (consumptionTotal/1000).toFixed(3).replace('.',',')+'&nbsp;kWh</h3>';
                 html_aggregation += '</div>';
                 html_aggregation += '<div class="card-body">';
                    html_aggregation += ' <canvas id="consumptionAggregation"></canvas>';
                 html_aggregation += '</div>';
                html_aggregation += '</div>'; //card
                html_aggregation += '</div>'; //col
                html_aggregation += '<div class="col-4">';
                html_aggregation +=  '<div class="card h-100">';
                 html_aggregation += '<div class="card-header">';
                    html_aggregation+='<h3>Kosten: '+ costTotal.toFixed(2).replace('.',',')+'&nbsp;€</h3>';
                 html_aggregation += '</div>';
                 html_aggregation += '<div class="card-body">';
                    html_aggregation += ' <canvas id="costAggregation"></canvas>';
                 html_aggregation += '</div>';
                html_aggregation += '</div>'; //card
                html_aggregation += '</div>'; //col
                html_aggregation += '<div class="col-4">';
                html_aggregation +=  '<div class="card h-100">';
                 html_aggregation += '<div class="card-header">';
                 html_aggregation += '<h3>Zusammenfassung</h3>';
                 html_aggregation += '</div>';
                 html_aggregation += '<div class="card-body">';
                 if(data.length>0) {
                    html_aggregation += '<table class="table table-striped">';
                    html_aggregation += '<tr><td>Stand:</td><td style="float-end">'+ new Date(data[0].endTime).toLocaleString()+'</td></tr>';
                    html_aggregation += '<tr><td>Kosten:</td><td style="float-end">'+ costTotal.toFixed(2).replace('.',',')+'&nbsp;€</td></tr>';
                    html_aggregation += '<tr><td>Verbrauch:</td><td style="float-end">'+ (consumptionTotal/1000).toFixed(3).replace('.',',')+'&nbsp;kWh</td></tr>';
                    html_aggregation += '<tr><td>Zählerstand:</td><td style="float-end">'+ (data[0].reading/1000).toFixed(3).replace('.',',')+'&nbsp;kWh</td></tr>';
                    for (const [key, value] of Object.entries(customLabels)) {
                        html_aggregation += '<tr><td>&nbsp;&nbsp;'+value+':</td><td style="float-end">'+ (data[0][key]/1000).toFixed(3).replace('.',',')+'&nbsp;kWh</td></tr>';
                    }
                    html_aggregation += '</table>';
                }
                 html_aggregation += '</div>';
                html_aggregation += '</div>'; //card
                html_aggregation += '</div>'; //col 
            html_aggregation += '</div>';

            $('#clearingBackend').html(html_aggregation + html_clearings);

            // Charting
            const ctxCost = document.getElementById('costAggregation');
            const ctxConsumption = document.getElementById('consumptionAggregation');

            let labels = [];
            let costData = [];
            let consumptionData = [];
            for (const [key, value] of Object.entries(customLabels)) {
                labels.push(value);
                costData.push(costAggregation[key]);
                consumptionData.push(consumptionAggregation[key] / 1000);
            }

            new Chart(ctxCost, {
              type: 'pie',
              data: {
                labels: labels,
                datasets: [{
                  label: 'Kosten:',
                  data: costData,
                  borderWidth: 1
                }]
              },
              options: {
              }
            });

            new Chart(ctxConsumption, {
                type: 'pie',
                data: {
                  labels: labels,
                  datasets: [{
                    label: 'Verbrauch:',
                    data: consumptionData,
                    borderWidth: 1
                  }]
                },
                options: {
                }
            });

        })
    });
});