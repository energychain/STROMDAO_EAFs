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
        retrieveBalances(window.assetId);
    })

    const renderTransactions = function(data) {
        let html = '';
        html += '<table class="table table-condensed table-striped">';
        html += '<thead>';
        html += '<tr><th>Von</th><th>Nach</th><th class="text-end">Energie</th></tr>';
        html += '</thead>';
        html += '<tbody>';
        for(let i=0;i<data.transactions.length;i++) {
            html += '<tr>';
            let highlight = '';
            if(data.transactions[i].from == data.upstream) highlight='fw-bold';
            if(data.transactions[i].to == data.upstream) highlight='fw-bold';

            html += '<td class="'+highlight+'"><button class="btn btn-light btn-sm openBalance" data-assetId="'+data.transactions[i].from+'" data-epoch="'+data.epoch+'" type="button">'+data.transactions[i].from+'</button></td>';
        
            html += '<td class="'+highlight+'"><button class="btn btn-light btn-sm openBalance" data-assetId="'+data.transactions[i].to+'" data-epoch="'+data.epoch+'" type="button">'+data.transactions[i].to+'</button></td>';
            html += '<td class="text-end '+highlight+'">'+(data.transactions[i].energy/1000).toFixed(3).replace('.',',')+'kWh</td>';
            html += '</tr>';
        }
        html += '</tbody>';
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
        html += '<th class="text-end">Saldo</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        let lastEpoch = 0;

        for(let i=0;i<data.length;i++) {
            data[i].energy *= -1; // clearerer to interpret.
            html += '<tr>';
            let bgclass = '';
            if(data[i].epoch == highlight) {
                bgclass = 'bg-success';
            }
            if(typeof data[i].seal == 'undefined') {
                html += '<td class="'+bgclass+' text-center"><button class="btn btn-xs btn-light btnClear" data-epoch="'+data[i].epoch+'"><i class="fa fa-unlock-alt text-warning"></i></td>';
            } else {
                html += '<td class="'+bgclass+' text-center">&nbsp;</td>';
            }
            html += '<td class="'+bgclass+'"><button class="btn btn-xs btn-light btnProduct" data-epoch="'+data[i].epoch+'">'+data[i].epoch+'</button></td>';
            html += '<td class="'+bgclass+'" title="Epoch '+data[i].epoch+'">'+new Date(data[i].time).toLocaleString()+'</td>';
            let color = 'text-danger';
            if(data[i].energy > 0) {
                color = 'text-success';
            }
            html += '<td class="'+color+' text-end '+bgclass+' ">'+(data[i].energy/1000).toFixed(3).replace('.',',')+'kWh</td>';
            html += '</tr>';
            lastEpoch = data[i].epoch;
        }
        html += '</tbody>';

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
    }

    /**
     * Retrieves balances for the given asset ID.
     *
     * @param {string} assetId - The ID of the asset.
     */
    const retrieveBalances =  function(assetId,highlight,before) {
        $('.assetLabel').html(assetId);
        $('#balances').html('');
        $.getJSON("/api/balancing/latestBalances?assetId="+assetId+"&n=10&before="+before,function(data) {
            renderBalances(data,highlight);
        });
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