$(document).ready(function() {
    let customLabels = {};
    if($.urlParam('meterId')) {
        window.assetId = $.urlParam('meterId'); 
    }
    if($.urlParam('assetId')) {
        window.assetId = $.urlParam('assetId'); 
    }
   
    $.getJSON("/api/tariff/customLabels", function(data) {
        customLabels = data;
        retrieveBalances(window.assetId,$.urlParam('epoch'));
    })

    const renderTransactions = function(data) {
        let html = '';
        html += '<table class="table table-condensed table-striped">';
        html += '<thead>';
        html += '<tr><th>Von</th><th>Nach</th><th class="text-end">Treibhausgasemission</th><th class="text-end">Energie</th><th class="text-end">Saldo</th></tr>';
        html += '</thead>';
        html += '<tbody>';
        let co2eq = 0;
        let energy = 0;
        let absenergy = 0;

        for(let i=0;i<data.transactions.length;i++) {
            if(data.transactions[i].energy !== 0) {
                html += '<tr>';
                let highlight = '';
                if(data.transactions[i].from == data.upstream) highlight='fw-bold';
                if(data.transactions[i].to == data.upstream) highlight='fw-bold';

                if(data.transactions[i].from == window.assetId) {
                    highlight += ' text-success ';
                } else {
                    highlight += ' text-danger ';
                }

                html += '<td class="'+highlight+'"><button class="btn btn-light btn-sm openBalance" data-assetId="'+data.transactions[i].from+'" data-epoch="'+data.epoch+'" type="button">'+data.transactions[i].from+'</button></td>';
                html += '<td class="'+highlight+'"><button class="btn btn-light btn-sm openBalance" data-assetId="'+data.transactions[i].to+'" data-epoch="'+data.epoch+'" type="button">'+data.transactions[i].to+'</button></td>';
                html += '<td class="text-end '+highlight+'">'+(data.transactions[i].co2eq/1000).toFixed(0).replace('.',',')+'eq</td>';
                absenergy += Math.abs(data.transactions[i].energy);

                if(data.transactions[i].from == window.assetId) {
                    co2eq += data.transactions[i].co2eq;
                    energy += data.transactions[i].energy;
                }
                if(data.transactions[i].to == window.assetId) {
                    co2eq -= data.transactions[i].co2eq;
                    energy -= data.transactions[i].energy;
                }
                html += '<td class="text-end '+highlight+'">'+(data.transactions[i].energy/1000).toFixed(3).replace('.',',')+'kWh</td>';
                html += '<td class="text-end '+highlight+'">'+(energy/-1000).toFixed(3).replace('.',',')+'kWh</td>';
                html += '</tr>';
            }
        }
        html += '</tbody>';
        html += '<tfoot>';
        html += '<tr><th></th><th></th><th class="text-end">'+(co2eq/1000).toFixed(0).replace('.',',')+'eq</th><th class="text-end">'+(data.energy/1000).toFixed(3).replace('.',',')+'kWh</th><th class="text-end">'+( (data.balancesum - data.energy) /1000).toFixed(3).replace('.',',')+'kWh</th></tr>';
        html += '</tfoot>';
        html += '</table>';
        $('#txTable').html(html);
        $('#balanceHeader').html("Bilanzierung:&nbsp;"+window.assetId+" - Produkt:&nbsp;"+data.epoch);
        if(typeof data.seal !=='undefined') {
            $('#sealBtn').removeClass('btn-warning');
            $('#sealBtn').html('<i class="fa fa-lock"></i>');
            $('#sealBtn').attr('disabled','disabled');
        } else {
            $('#sealBtn').addClass('btn-warning');
            $('#sealBtn').html('<i class="fa fa-unlock-alt"></i>');
            $('#sealBtn').removeAttr('disabled');
        }
        $('#sealBtn').off();
        $('#sealBtn').click(function() {
            $.getJSON("/api/balancing/seal?assetId="+window.assetId+"&epoch="+data.epoch, function(data) {
                retrieveBalances(window.assetId);
                $('#modalTransactions').modal('hide');
            });
        });
        $('.openBalance').off();
        $('.openBalance').click(function() {
            window.assetId = $(this).attr('data-assetId');
            retrieveBalances(window.assetId,$(this).attr('data-epoch'));
            $('#modalTransactions').modal('hide');
        })
    }
    const renderBalances = function(data,highlight) {
        let html ='';
        html += '<table class="table table-condensed table-striped">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>&nbsp;</th>';
        html += '<th>Stromprodukt</th>';
        html += '<th>Zeitfenster</th>';
        html += '<th class="text-end">Treibhausgasemission</th>';
        html += '<th class="text-end">Direktlieferung</th>';
        html += '<th class="text-end">Ausgleich</th>';
        html += '<th>Zertifikat</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        let lastEpoch = 0;
        let chartDataEnergy = [];
        let chartDataCO2 = [];
        let chartLabels = [];
        let chartDataDirect = [];
        let totalEnergy = 0;
        let totalCO2 = 0;
        let totalBalancing = 0;
        let totalDirect = 0;
        let totalIn = 0;
        let totalOut = 0;


        for(let i=0;i<data.length;i++) {
            data[i].energy *= -1; // clearerer to interpret.
            data[i].balancesum *= -1;  // clearerer to interpret.
            data[i].co2eq *= -1; // clearerer to interpret.
            html += '<tr>';
            let bgclass = '';
            if(data[i].epoch == highlight) {
                bgclass = 'bg-secondary';
            }
            if(typeof data[i].seal == 'undefined') {
                html += '<td class="'+bgclass+' text-center"><button class="btn btn-xs btn-light btnClear" data-epoch="'+data[i].epoch+'"><i class="fa fa-unlock-alt text-warning"></i></td>';
            } else {
                html += '<td class="'+bgclass+' text-center">&nbsp;</td>';
            }
            chartLabels.push(new Date(data[i].time).toLocaleString()+" ("+data[i].epoch+")");
            html += '<td class="'+bgclass+'"><button class="btn btn-xs btn-light btnProduct" data-epoch="'+data[i].epoch+'">'+data[i].epoch+'</button></td>';
            html += '<td class="'+bgclass+'" title="Epoch '+data[i].epoch+'">'+new Date(data[i].time).toLocaleString()+'</td>';
            let color = 'text-danger';
            if(data[i].energy > 0) {
                color = 'text-success';
            }
            let co2 = data[i].co2eq/(-1000);
            let energy_direct = (Math.abs(data[i].balancesum)-Math.abs(data[i].energy))/1000;
            let energy_balance = data[i].energy/-1000;

            chartDataCO2.push(Math.round(co2));
            chartDataDirect.push(energy_direct);
            chartDataEnergy.push(energy_balance);
            
            totalBalancing += energy_balance;
            totalDirect += energy_direct;
            totalCO2 += co2;
            if(energy_balance > 0) {
                totalIn += energy_balance;
            } else {
                totalOut += energy_balance;
            }

            if(typeof data[i].sum == 'undefined') { data[i].sum=0; }

            html += '<td class="'+color+' text-end '+bgclass+' ">'+(co2).toFixed(0).replace('.',',')+'eq</td>';
            html += '<td class="'+color+' text-end '+bgclass+' ">'+(energy_direct).toFixed(3).replace('.',',')+'kWh</td>';
            html += '<td class="'+color+' text-end '+bgclass+' ">'+(energy_balance).toFixed(3).replace('.',',')+'kWh</td>';
            if(typeof data[i].seal == 'undefined') {
                html += '<td class="'+bgclass+'">&nbsp;</td>';
            } else {
                html += '<td class="'+bgclass+'"><button class="btn btn-xs btn-light btnSeal" data-seal="'+data[i].seal+'"><i class="fa fa-certificate"></i></button></td>';
            }
            html += '</tr>';
            lastEpoch = data[i].epoch;
        }
        html += '<tfoot>';
        html += '<tr>';
        html += '<th>&nbsp;</th>';
        html += '<th colspan="2">von '+new Date(data[data.length-1].time).toLocaleString()+'<br/>bis '+new Date(data[0].time).toLocaleString()+' </th>';
        html += '<th class="text-end" valign="top">'+totalCO2.toFixed(0).replace('.',',')+'eq</th>';
        html += '<th class="text-end" valign="top">'+totalDirect.toFixed(3).replace('.',',')+'kWh</th>';
        html += '<th class="text-end" valign="top"><span class="text-danger">'+totalIn.toFixed(3).replace('.',',')+'kWh</span><br/><span class="text-success">'+totalOut.toFixed(3).replace('.',',')+'kWh</span><br/>'+totalBalancing.toFixed(3).replace('.',',')+'kWh</th>';
        html += '</tr>';
        html += '</tfoot>';
        html += '</tbody>';
        chartDataCO2.reverse();
        chartDataEnergy.reverse();
        chartLabels.reverse();
        chartDataDirect.reverse();
        html += '</table>';
        $('#balances').html(html);
        $('.btnClear').off();
        $('.btnClear').click(function() {
            $.getJSON("/api/balancing/seal?assetId="+window.assetId+"&epoch="+$(this).data('epoch'), function(data) {
                retrieveBalances(window.assetId);
            });
        });
        $('.btnProduct').off();
        $('.btnProduct').click(function() {
            $.getJSON("/api/balancing/balance?assetId="+window.assetId+"&epoch="+$(this).data('epoch'), function(data) {
                    renderTransactions(data);
                    $('#modalTransactions').modal('show');
            });
        });
        $('#backBtn').off();
        $('#backBtn').click(function() {
            retrieveBalances(window.assetId,highlight,lastEpoch);
        });
        $('#fwdBtn').click(function() {
            retrieveBalances(window.assetId,highlight,data[0].epoch + 10);
        });
        $('.btnSeal').off();
        $('.btnSeal').click(function() {
            qrcode = new QRCode(document.getElementById("qrcode"), {
                text: $(this).data('seal'),
                width: 256,
                height: 256,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            $('#certificate').val($(this).data('seal'));
            $('#modalSeal').modal('show');
        });

        $("#copy-button").click(function() {
            if (navigator.clipboard) {
                var certificate = $("#certificate").val();
                navigator.clipboard.writeText(certificate);
                $("#copy-button").removeClass('btn-dark');
                $("#copy-button").addClass('btn-success');
                setTimeout(function() {
                    $("#copy-button").removeClass('btn-success');
                    $("#copy-button").addClass('btn-dark');
                },2000);
            } else {
                $("#copy-button").removeClass('btn-dark');
                $("#copy-button").addClass('btn-danger');
                $('#copy-button').attr('disabled','disabled');
            }
        });
        if (!navigator.clipboard) {
            $("#copy-button").removeClass('btn-dark');
            $("#copy-button").addClass('btn-danger');
            $('#copy-button').attr('disabled','disabled');
            $('#copy-button').attr('title','Seite nicht über https geladen oder Browser nicht unterstützt.');
        }
        window.epochData = {};

        const ctxChart = document.getElementById('profileChart');
        if(typeof window.chartObject !== 'undefined') window.chartObject.destroy();

        let unit = 'kWh';

        datasets = [{
            label: 'Treibhausgasemission (g)',
            data: chartDataCO2,
            backgroundColor:["#c69006"],
            yAxisID: 'A',
            },
            {
                label: 'Ausgleich, extern (kWh)',
                fill:true,
                data: chartDataEnergy,
                backgroundColor:["#a0a0a0"],
                yAxisID: 'B',
            },            {
                label: 'Direktlieferung, intern (kWh)',
                fill:true,
                data: chartDataDirect,
                backgroundColor:["#147a50"],
                yAxisID: 'B',
            }];
        

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

    /**
     * Retrieves balances for the given asset ID.
     *
     * @param {string} assetId - The ID of the asset.
     */
    const retrieveBalances =  function(assetId,highlight,before) {
        $('.assetLabel').html(assetId);
        $('#balances').html('');
        $.getJSON("/api/balancing/latestBalances?assetId="+assetId+"&n=25&before="+before,function(data) {
            renderBalances(data,highlight);
        });
        $.getJSON("/api/asset/get?assetId="+assetId+"&type=balance", function(data) {
            if(typeof data.balancerule !== 'undefined') {
                if(typeof data.balancerule.from !== 'undefined') {
                    $('#allocation_from').val(data.balancerule.from);
                    $('#direction-from').attr('checked','checked');
                }
                if(typeof data.balancerule.to !== 'undefined') {
                    $('#allocation_to').val(data.balancerule.to);
                    $('#direction-to').attr('checked','checked');
                }
            }
        });
    }

    $('#balancerule').submit(function(e) {
        e.preventDefault();
        $('#btnRule').attr('disabled','disabled');
        let balancerule = {};
        let rule = $("#balancerule").serializeArray();
        for(let i=0;i<rule.length;i++) {
            balancerule[rule[i].name] = rule[i].value;
        }
        let apiData = {};
        if ($("#direction-from").is(":checked")) {
            apiData.from = $('#allocation_from').val();
        }

        if ($("#direction-to").is(":checked")) {
            apiData.to = $('#allocation_to').val();
        }

        apiData.updated = new Date().getTime();

        $.ajax({
            type: 'POST',
            url: '/api/asset/upsert', 
            data: JSON.stringify({
                assetId: window.assetId,
                type: 'balance', //realy? maybe we could split here
                balancerule: apiData
            }),
            contentType: 'application/json',
            success: function(response) {
                // Set Counter Rule
                console.log(response);
                $('#btnRule').removeAttr('disabled');
            }
        });     

        // console.log(balancerule);
    });
    $('#balancingHelper').click(function(e) {
        location.href="./uc_balancehelper.html?assetId="+window.assetId;
    })
});