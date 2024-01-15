$(document).ready(function() {
    let customLabels = {};
    const balanceRetrieve = (assetId,epoch) => {
        window.assetId = assetId;
        window.highlightEpoch = 1 * epoch;

        $('#assetLabel').html(window.assetId);

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
            console.log("Balancing rule",data);
        });
    }

    const showLedger = function() {
        const updateTXs =  function(assetId,epoch,label)   {    
                $.getJSON("/api/balancing/statements?assetId="+assetId+"&epoch="+epoch+"&label="+label,function(data) {
                                    let html = '<table class="table table-condensed table-striped">';
                                    html += '<thead>';
                                    html += '<tr>';
                                    html += '<th>Von</th>';
                                    html += '<th>An</th>';
                                    html += '<th>Energie</th>';
                                    html += '</tr>';
                                    html += '</thead>';
                                    html += '<tbody>';
                                    for(let i=0;i<data.length;i++) {
                                        html += '<tr>';
                                        let btnclass = 'btn-light';
                                        if(data[i].from == window.assetId) {
                                            btnclass = 'btn-success';
                                        }
                                        html += '<td><button class="btn btn-sm '+btnclass+' btnAsset" data-assetId="'+data[i].from+'" data-epoch="'+data[i].epoch+'">' + data[i].from + '</button></td>';
                                        btnclass = 'btn-light';
                                        if(data[i].to == window.assetId) {
                                            btnclass = 'btn-success';
                                        }
                                        html += '<td><button class="btn btn-sm '+btnclass+' btnAsset" data-assetId="'+data[i].to+'" data-epoch="'+data[i].epoch+'">' + data[i].to + '</button></td>';
                                        html += '<td>' + (data[i].energy/1000).toFixed(3).replace('.',',') + 'kWh</td>';
                                        html += '</tr>';
                                    }
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
        let html = '<table class="table table-condensed">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Allokation</th>';
        html += '<th>Stromprodukt</th>';
        html += '<th>Lieferung</th>';
        html += '<th>Einspeisung</th>';
        html += '<th>Saldo</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        html += '<tr>';
        html += '<td class="notFiltered">'+window.assetId+'</td>';
        html += '<td>'+new Date($(this).attr('data-time')* 1).toLocaleString()+'</td>'; 
        html += '<td>'+($(this).attr('data-in')/1000).toFixed(3).replace('.',',')+'kWh</td>';
        html += '<td>'+($(this).attr('data-out')/1000).toFixed(3).replace('.',',')+'kWh</td>';
        html += '<td>'+(($(this).attr('data-out') - $(this).attr('data-in'))/1000).toFixed(3).replace('.',',')+'kWh</td>';
        html += '</tbody>';
        html += '</table>';
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
        html += '<th>Stromprodukt</th>';
        html += '<th>Segment</th>';
        html += '<th>Lieferung</th>';
        html += '<th>Einspeisung</th>';
        html += '<th>Saldo</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        for(let i=0;i<data.length;i++) {
            let marker = '';
            if(data[i].epoch == window.highlightEpoch) {
                marker = ' class="text-bg-success" ';
            }
            html += '<tr>';
            html += '<td'+marker+'><button class="btn btn-sm btn-light btnLedger" data-epoch="'+data[i].epoch+'" data-label="'+data[i].label+'" data-in="'+data[i].in+'" data-out="'+data[i].out+'" data-time="'+data[i].time+'">' + new Date(data[i].time).toLocaleString() + '</button></td>';
            html += '<td'+marker+'>' + customLabels[data[i].label] + '</td>';
            html += '<td'+marker+'>' + (data[i].in/1000).toFixed(3).replace('.',',') + 'kWh</td>';
            html += '<td'+marker+'>' + (data[i].out/1000).toFixed(3).replace('.',',') + 'kWh</td>';
            html += '<td'+marker+'>' + ((data[i].out - data[i].in)/1000).toFixed(3).replace('.',',') + 'kWh</td>';
            html += '</tr>';
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
            balanceRetrieve($.urlParam('assetId'));
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
              console.log(response);
              $('#btnRule').removeAttr('disabled');
            }
        });     

        // console.log(balancerule);
    });
});