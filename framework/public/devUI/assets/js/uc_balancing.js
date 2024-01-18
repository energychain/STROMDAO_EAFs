$(document).ready(function() {
    let customLabels = {};
    const balanceRetrieve = (assetId,epoch) => {
        window.assetId = assetId;
        window.highlightEpoch = 1 * epoch;

        $('.assetLabel').html(window.assetId);

        let epochQuery = "";
        if(epoch) {
            epochQuery = "&epoch="+epoch;
        }
        $.getJSON("/api/balancing/balance?assetId="+assetId+epochQuery,balanceRender);
        $.getJSON("/api/asset/get?assetId="+assetId+"&type=balance", function(data) {
            if(typeof data.balancerule !== 'undefined') {
                if(typeof data.balancerule.from !== 'undefined') {
                    $('#allocation').val(data.balancerule.from);
                    $('#direction-from').attr('checked','checked');
                }
                if(typeof data.balancerule.to !== 'undefined') {
                    $('#allocation').val(data.balancerule.to);
                    $('#direction-to').attr('checked','checked');
                }
            }
        });
    }

    const showLedger = function() {
        const updateTXs =  function(assetId,epoch,label)   {    
                $.getJSON("/api/balancing/statements?assetId="+assetId+"&epoch="+epoch+"&label="+label,function(data) {
                                    let openSaldo = 0;
                                    let closeSaldo = 0;
                                    let html = '<table class="table table-condensed table-striped">';
                                    html += '<thead>';
                                    html += '<tr>';
                                    html += '<th>&nbsp;</th>';
                                    html += '<th>Von</th>';
                                    html += '<th>An</th>';
                                    html += '<th>Energie</th>';
                                    html += '</tr>';
                                    html += '</thead>';

                                    let hasUpstream = false;
                                    let opening_rows = '';
                                    let closing_rows = '';

                                    for(let i=0;i<data.length;i++) {
                                       
                                        if(data[i].isUpstream) {
                                            hasUpstream = true;
                                        }
                                        let mult = -1;
                                        let saldo = 0;

                                        if(data[i].label == '.clearing') {
                                            closeSaldo += data[i].energy * mult; 
                                            const tmp = data[i].from;
                                            data[i].from = data[i].to;
                                            data[i].to = tmp;
                                            saldo = closeSaldo;
                                        } else {
                                            openSaldo += data[i].energy * mult; 
                                            saldo = openSaldo;
                                        }
                                        let html_row = '<tr>';
                                        if(data[i].sealed) {
                                            html_row += '<td><i class="fa fa-lock"></i></td>';
                                        } else {
                                            html_row += '<td>&nbsp;</td>';
                                        }
                                        let btnclass = 'btn-light';
                                        if(data[i].from == window.assetId) {
                           
                                            mult = 1;
                                        }
                                        html_row += '<td><button class="btn btn-sm '+btnclass+' btnAsset" data-assetId="'+data[i].from+'" data-epoch="'+data[i].epoch+'">' + data[i].from + '</button></td>';
                                        
                                        btnclass = 'btn-light';

                                        html_row += '<td><button class="btn btn-sm '+btnclass+' btnAsset" data-assetId="'+data[i].to+'" data-epoch="'+data[i].epoch+'">' + data[i].to + '</button></td>';
                                        html_row += '<td>' + (data[i].energy/1000).toFixed(3).replace('.',',') + 'kWh</td>';
                                        html_row += '</tr>';
                                       
                                        if(data[i].label == '.clearing') {
                                            closing_rows += html_row;
                                        } else {
                                            opening_rows += html_row;
                                        }
                                    }
                                    html += '<thead>';
                                    html += '<th><th colspan=5>Abschlussbuchungen</th></tr>';
                                    html += '</thead>';
                                    html += '<tbody>';
                                    html +=  closing_rows;
                                    html += '</tbody>';
                                    html += '<thead><tr><th colspan="5">&nbsp;</th></tr></thead>';
                                    html += '<thead>';
                                    html += '<th><th colspan="5">Verlauf</th></tr>';
                                    html += '</thead>';
                                    html += '<tbody>';
                                    html +=  opening_rows;
                                    html += '</tbody>';
                                 
                                    html += '</table>';

                                    $('#txTable').html(html);
                                    $('#activeFilter').off();
                                    $('#activeFilter').click(function() {
                                        updateTXs(null,epoch, label);
                                        $('#activeFilter').hide();
                                        $('#deactivatedFilter').show();
                                    });
                                    if(assetId !== null) {
                                        $('.notFiltered').removeClass('text-decoration-line-through');
                                        $('#activeFilter').show();
                                        $('#deactivatedFilter').hide();
                                    } else {
                                        $('.notFiltered').addClass('text-decoration-line-through');
                                        $('#activeFilter').hide();
                                        $('#deactivatedFilter').show();
                                    }

                                    $('#deactivatedFilter').click(function() {
                                        updateTXs(window.assetId,epoch, label);
                                        $('#activeFilter').show();
                                        $('#deactivatedFilter').hide();
                                    });
                                    $('.btnAsset').off();
                                    $('.btnAsset').click(function() {
                                        balanceRetrieve($(this).attr('data-assetId'),epoch);
                                        $('#modalStatement').modal('hide');
                                    });
                });
        }

        $('.filterAsset').html(window.assetId);
        $('#txTable').html('...');
        $('#balanceModal').html('...');
        if( ($(this).data('sealed')) && ($(this).data('sealed').length > 0)) {
            $('#sealBtn').html('<i class="fa fa-lock"></i>');
            $('#sealBtn').addClass('btn-light');
            $('#sealBtn').removeClass('btn-warning')
            $('#sealBtn').attr('disabled','disabled');
            $.getJSON("/api/balancing/decodeSeal?seal="+$(this).data('sealed'),function(data) {
                if(data.from == window.assetId) {
                    $('#fromorto').html('Marktpartner');
                    $('#marketpartner').html('<button class="btn btn-sm btn-light btnAsset" data-assetid="'+data.to+'" data-epoch="'+data.epoch+'">'+data.to+'</button>');
                } else {
                    $('#fromorto').html('Marktpartner');
                    $('#marketpartner').html('<button class="btn btn-sm btn-light btnAsset" data-assetid="'+data.from+'" data-epoch="'+data.epoch+'">'+data.from+'</button>');
                }
                $('.btnAsset').off();
                $('.btnAsset').click(function() {
                    balanceRetrieve($(this).attr('data-assetId'),epoch);
                    $('#modalStatement').modal('hide');
                });
            })
        } else {
            $('#sealBtn').html('<i class="fa fa-unlock-alt"></i>');
            $('#sealBtn').addClass('btn-warning');
            $('#sealBtn').removeClass('btn-light');
            $('#sealBtn').removeAttr('disabled');
        }
        let html = '<table class="table">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Allokation</th>';
        html += '<th>Stromprodukt</th>';
        html += '<th>Entnahme</th>';
        html += '<th>Einspeisung</th>';
        html += '<th>Verlauf</th>';
        html += '<th id="fromorto"></th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        html += '<tr>';
        html += '<td class="notFiltered">'+window.assetId+'</td>';
        html += '<td title="'+$(this).attr('data-epoch')+'">'+new Date($(this).attr('data-time')* 1).toLocaleString()+'</td>'; 
        html += '<td>'+($(this).attr('data-in')/1000).toFixed(3).replace('.',',')+'kWh</td>';
        html += '<td>'+($(this).attr('data-out')/1000).toFixed(3).replace('.',',')+'kWh</td>';
        html += '<td>'+(($(this).attr('data-out') - $(this).attr('data-in'))/1000).toFixed(3).replace('.',',')+'kWh</td>';
        html += '<td id="marketpartner"></td>';
        html += '</tbody>';
        html += '</table>';
        $('#sealBtn').attr('data-epoch',$(this).attr('data-epoch'));
        $('#balanceModal').html(html);
        $('#modalStatement').modal('show');
        updateTXs(window.assetId,$(this).attr('data-epoch'), $(this).attr('data-label'));
    }

    const balanceRender = (data) => {
        if(data.length == 0) {
            $('#epochbalance').html("");
            return;
        }
        let html = '<table class="table table-condensed table-striped">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>&nbsp;</th>';
        html += '<th>Stromprodukt</th>';
        html += '<th>Segment</th>';
        html += '<th>Bezug</th>';
        html += '<th>Einspeisung</th>';
        html += '<th>Saldo</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        for(let i=0;i<data.length;i++) {
            if(data[i].label !== '.clearingX') {
                let marker = '';
                if(data[i].epoch == window.highlightEpoch) {
                    marker = ' class="text-bg-success" ';
                }
                html += '<tr>';
                if(typeof data[i].sealed !== 'undefined') {
                    html += '<td>&nbsp;</td>';
                } else {
                    data[i].sealed = "";
                    html += '<td'+marker+'><button class="btn btn-sm btn-light btnLedger" data-epoch="'+data[i].epoch+'" data-label="'+data[i].label+'" data-in="'+data[i].in+'" data-out="'+data[i].out+'" data-time="'+data[i].time+'" data-sealed="'+data[i].sealed+'"><i class="fa fa-unlock-alt text-warning"></i></button></td>';
                }
                html += '<td'+marker+'><button class="btn btn-sm btn-light btnLedger" data-epoch="'+data[i].epoch+'" data-label="'+data[i].label+'" data-in="'+data[i].in+'" data-out="'+data[i].out+'" data-time="'+data[i].time+'" data-sealed="'+data[i].sealed+'">' + new Date(data[i].time).toLocaleString() + '</button></td>';
                html += '<td'+marker+'>' + customLabels[data[i].label] + '</td>';
                html += '<td'+marker+'>' + (data[i].in/1000).toFixed(3).replace('.',',') + 'kWh</td>';
                html += '<td'+marker+'>' + (data[i].out/1000).toFixed(3).replace('.',',') + 'kWh</td>';
                html += '<td'+marker+'>' + ((data[i].out - data[i].in)/1000).toFixed(3).replace('.',',') + 'kWh</td>';
                html += '</tr>';
            }
        }
        html += '</tbody>';
        html += '</table>';
        $('#backBtn').attr('data-epoch',data[data.length-1].epoch);
        $('#fwdBtn').attr('data-epoch',data[0].epoch + 24);
        $('#epochbalance').html(html);
        $('.btnLedger').off();
        $('.btnLedger').click(showLedger);
    }
    $.getJSON("/api/tariff/customLabels", function(data) {
        customLabels = data;
       

        if($.urlParam('assetId')) {
            $('#searchMeter').val($.urlParam('assetId'));
            balanceRetrieve($.urlParam('assetId'),$.urlParam('epoch'));
        } else {
            balanceRetrieve('eaf_general');
        }
        $('#backBtn').click(function() {
            balanceRetrieve(window.assetId,$(this).attr('data-epoch'));
        });
        $('#fwdBtn').click(function() {
            balanceRetrieve(window.assetId,$(this).attr('data-epoch'));
        });


    });

    $('#sealBtn').click(function(e) {
        $.getJSON("/api/balancing/sealBalance?assetId="+window.assetId+"&epoch="+$(this).attr('data-epoch'), function(data) {
             $('#modalStatement').modal('hide');
             balanceRetrieve(window.assetId,$(this).attr('data-epoch'));
        });
    });
    $('#balancerule').submit(function(e) {
        e.preventDefault();
        $('#btnRule').attr('disabled','disabled');
        let balancerule = {};
        let rule = $("#balancerule").serializeArray();
        for(let i=0;i<rule.length;i++) {
            balancerule[rule[i].name] = rule[i].value;
        }
        let apiData = {};
        if(balancerule.direction == 'in') {
            apiData.from = balancerule.allocation

        } else {
            apiData.to = balancerule.allocation
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
});