$(document).ready(function() {
    let customLabels = {};
    $.getJSON("/api/access/settings",function(data) {
        window.eaf_settings = data;
    });

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
        let fromData = [];
        let fromLabels = [];
        let toData = [];
        let toLabels = [];
        let html = '';
        html += '<table class="table table-condensed">';
        html += '<thead>';
        html += '<tr><th>Von</th><th class="text-end">kWh</th><th class="text-end">Nach</th><th class="text-end">kWh</th></tr>';
        html += '</thead>';
        html += '<tbody>';
        html += '<tr><td colspan=2 style="height:200px"> <canvas id="fromChart" style="height:200px"></canvas></td><td colspan=2 style="height:200px"><canvas id="toChart" style="height:200px"></canvas></td></tr>';
        let einspeiser = '';
        for (const [key, value] of Object.entries(data.peers.from)) {
            einspeiser += '<tr><td><a class="btn btn-light btn-sm openBalance" data-assetId="'+key+'" data-epoch="'+data.epoch+'" type="button">'+key+'</a></td><td class="float-end">'+(value.energy/1000).toFixed(3).replace('.',',')+'</td></tr>';
            fromData.push(value.energy/1000);
            fromLabels.push(key);
        }
        let bezug = '';
        for (const [key, value] of Object.entries(data.peers.to)) {
            bezug += '<tr><td><a class="btn btn-light btn-sm openBalance" data-assetId="'+key+'" data-epoch="'+data.epoch+'" type="button">'+key+'</a></td><td class="float-end">'+(value.energy/1000).toFixed(3).replace('.',',')+'</td></tr>';
            toData.push(value.energy/1000);
            toLabels.push(key);
        }
        html += '<tr><td colspan=2><table class="table">'+einspeiser+'</table></td><td colspan=2><table class="table">'+bezug+'</table></td></tr>';
        html += '</tbody>';


        html += '</table>';
        html += '<h4 class="modal-title" style="margin-top:25px;">Transaktionen</h4>';
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

        const ctxToChart = document.getElementById('toChart');
        if(typeof window.wtoChart !== 'undefined') window.wtoChart.destroy();

        window.wtoChart = new Chart(ctxToChart,{
            type: 'doughnut',
            data: {
                labels: toLabels,
                datasets: [{
                    label: '',
                    data: toData,
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
                    }
                }
            }
        });


        const ctxFromChart = document.getElementById('fromChart');
        if(typeof window.wfromChart !== 'undefined') window.wfromChart.destroy();

        window.wfromChart = new Chart(ctxFromChart,{
            type: 'doughnut',
            data: {
                labels: fromLabels,
                datasets: [{
                    label: '',
                    data: fromData,
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
                    }
                }
            }
        });


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
            $('#searchMeter').val(window.assetId);
            retrieveBalances(window.assetId,$(this).attr('data-epoch'));
            initGraph();
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
        let chartNav = [];
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
            let label = new Date(data[i].time).toLocaleTimeString();
            if((i == 0) || (i==data.length-1)) {
                label = new Date(data[i].time).toLocaleString();
            }
            chartLabels.push(label);
            chartNav.push(""+data[i].epoch);
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
        if(data.length > 0) {
            html += '<tfoot>';
            html += '<tr>';
            html += '<th>&nbsp;</th>';
            let timeFrame = 'von <span class="float-end">'+new Date(data[data.length-1].time).toLocaleString()+'</span><br/>bis <span class="float-end">'+new Date(data[0].time).toLocaleString()+'</span> ';
            html += '<th colspan="2">'+timeFrame+'</th>';
            html += '<th class="text-end" valign="top">'+totalCO2.toFixed(0).replace('.',',')+'eq</th>';
            html += '<th class="text-end" valign="top">'+totalDirect.toFixed(3).replace('.',',')+'kWh</th>';
            html += '<th class="text-end" valign="top"><span class="text-danger">'+totalIn.toFixed(3).replace('.',',')+'kWh</span><br/><span class="text-success">'+totalOut.toFixed(3).replace('.',',')+'kWh</span><br/>'+totalBalancing.toFixed(3).replace('.',',')+'kWh</th>';
            html += '</tr>';
            html += '</tfoot>';
        }
        html += '</tbody>';
        $('#timeFrame').html(timeFrame);
        let results = 'Direkt (intern):<span class="float-end">'+totalDirect.toFixed(3).replace('.',',')+'kWh</span><br/>';
         results += 'Ausgleich (extern):<span class="float-end">'+totalBalancing.toFixed(3).replace('.',',')+'kWh</span><br/>';




        $('#resultStats').html(results)
       
        let actionrow = '';

        actionrow += '<button class="btn btn-xs btn-light btnClear openPWA" title="Letztverbraucher APP öffnen" data-id="'+window.assetId+'"><i class="fa fa-window-restore"></i></button>';
        actionrow += '<button class="btn btn-xs btn-light btnClear openProfile" title="Lastgangprofil öffnen" data-id="'+window.assetId+'"><i class="fa fa-bar-chart-o"></i></button>';
        actionrow += '<button class="btn btn-xs btn-light btnClear openReading" title="Zählerstandserfassung öffnen" data-id="'+window.assetId+'"><i class="fa fa-pencil"></i></button>';
        actionrow += '<button class="btn btn-xs btn-light btnClear openClearing" title="Clearing öffnen" data-id="'+window.assetId+'"><i class="fa fa-euro"></i></button>';
        actionrow += '<button class="btn btn-xs btn-light btnClear openBalancing" title="Bilanzierung öffnen" data-id="'+window.assetId+'"><i class="fa fa-balance-scale"></i></button>';
        actionrow += '';
       
        $('#actionRow').html(actionrow);

        chartDataCO2.reverse();
        chartDataEnergy.reverse();
        chartLabels.reverse();
        chartNav.reverse();
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
            label: 'Emission (g)',
            data: chartDataCO2,
            backgroundColor:["#c69006"],
            yAxisID: 'A',
            },
            {
                label: 'Direkt (kWh)',
                fill:true,
                data: chartDataDirect,
                backgroundColor:["#147a50"],
                yAxisID: 'B',
            },
            {
                label: 'Ausgleich (kWh)',
                fill:true,
                data: chartDataEnergy,
                backgroundColor:["#a0a0a0"],
                yAxisID: 'B',
            }            ];
        

        window.chartObject = new Chart(ctxChart, {
            type: 'line',
            data: {
              labels: chartLabels,
              datasets: datasets
            },
            options: {
                onClick: function(event, elements) {
                    if (elements.length > 0) {
                      $.getJSON("/api/balancing/balance?assetId="+window.assetId+"&epoch="+chartNav[elements[0].index], function(data) {
                        renderTransactions(data);
                        $('#modalTransactions').modal('show');
                       });
                    }
                },
                tooltips: {
                    callbacks: {
                      
                            label: function(tooltipItem, data) {
                              // Formatieren des Labels des Tooltips
                              console.log("HALLO");
                              return '$' + tooltipItem.yLabel.toFixed(2);
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
        window.chartObject.canvas.parentNode.style.height = '100%';
        window.chartObject.canvas.parentNode.style.width = '100%';
        window.chartObject.resize();
        window.paper.scaleContentToFit({ padding: 10 });

        // Event Handler for Action Row
        $('.openPWA').off();
        $('.openPWA').click(function() {
            const meterId = $(this).data('id');
            $.getJSON("/api/access/createMeterJWT?meterId="+meterId, function(data) {
                let baseUrl = location.protocol + '//' + location.hostname + ':' + window.eaf_settings.PORT_PWA;
                if((typeof window.eaf_settings.PWA_URL !== 'undefined') && (window.eaf_settings.PWA_URL !== '') && (window.eaf_settings.PWA_URL !== null)) {
                    baseUrl = window.eaf_settings.PWA_URL;
                }
                let url = baseUrl + '/?token=' + data+'&meterId='+meterId;
                window.open(url, '_blank');
            });
        });
        $('.openProfile').off();
        $('.openProfile').click(function() {
            console.log("jhsssss");
            const meterId = $(this).data('id');
            location.href="./uc_energyprofile.html?meterId="+meterId;
        });
        $('.openReading').off();
        $('.openReading').click(function() {
            const meterId = $(this).data('id');
            location.href="./uc_meterreading.html?meterId="+meterId;
        });
        $('.openClearing').off();
        $('.openClearing').click(function() {
            const meterId = $(this).data('id');
            location.href="./uc_clearing.html?meterId="+meterId;
        });
        $('.openBalancing').off();
        $('.openBalancing').click(function() {
            const meterId = $(this).data('id');
            location.href="./uc_balancing.html?assetId="+meterId;
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
                $(".mutable").addClass("bg-light");
                $('#btnRule').attr('disabled','disabled');
            }
        });     

        // console.log(balancerule);
    });
    $('#balancingHelper').click(function(e) {
        location.href="./uc_balancehelper.html?assetId="+window.assetId;
    })
    $('#allocation_from').on('keypress',function(e) {
        $('#direction-from').prop('checked',true);
    })
    $('#allocation_to').on('keypress',function(e) {
        $('#direction-to').prop('checked',true);
    })
    $(function() {
        $(".mutable").addClass("bg-light");
        $('#btnRule').attr('disabled','disabled');
        $(".mutable").on("click", function() {
            $(this).removeClass("bg-light");
            $('#btnRule').removeAttr('disabled');
        });
      });
});