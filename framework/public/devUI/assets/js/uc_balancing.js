$(document).ready(function() {
    let customLabels = {};

    $.getJSON("/api/tariff/customLabels", function(data) {
        customLabels = data;
        const balanceRender = (data) => {
            if(data.length == 0) {
                $('#epochbalance').html("");
                return;
            }
            let html = '<table class="table table-condensed table-striped">';
            html += '<thead>';
            html += '<tr>';
            html += '<th>Zeitscheibe</th>';
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
                html += '<td'+marker+'><button class="btn btn-sm btn-dark btnLedger" data-epoch="'+data[i].epoch+'" data-label="'+data[i].label+'" data-in="'+data[i].in+'" data-out="'+data[i].out+'" data-time="'+data[i].time+'">' + new Date(data[i].time).toLocaleString() + '</button></td>';
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
            $('.btnLedger').click(function() {
                $('#txTable').html('...');
                $('#balanceModal').html('...');
                let html = '<table class="table table-condensed">';
                html += '<thead>';
                html += '<tr>';
                html += '<th>Zeitscheibe</th>';
                html += '<th>Lieferung</th>';
                html += '<th>Einspeisung</th>';
                html += '<th>Saldo</th>';
                html += '</tr>';
                html += '</thead>';
                html += '<tbody>';
                html += '<tr>';
                html += '<td>'+new Date($(this).attr('data-time')* 1).toLocaleString()+'</td>'; 
                html += '<td>'+($(this).attr('data-in')/1000).toFixed(3).replace('.',',')+'kWh</td>';
                html += '<td>'+($(this).attr('data-out')/1000).toFixed(3).replace('.',',')+'kWh</td>';
                html += '<td>'+(($(this).attr('data-out') - $(this).attr('data-in'))/1000).toFixed(3).replace('.',',')+'kWh</td>';
                html += '</tbody>';
                html += '</table>';
                console.log("html",html);
                $('#balanceModal').html(html);
                $('#modalStatement').modal('show');
                $.getJSON("/api/balancing/statements?assetId="+window.assetId+"&epoch="+$(this).attr('data-epoch')+"&label="+$(this).attr('data-label'),function(data) {
                    let html = '<table class="table table-condensed table-striped">';
                    html += '<thead>';
                    html += '<tr>';
                    html += '<th>Zeitscheibe</th>';
                    html += '<th>Von</th>';
                    html += '<th>An</th>';
                    html += '<th>Energie</th>';
                    html += '</tr>';
                    html += '</thead>';
                    html += '<tbody>';
                    for(let i=0;i<data.length;i++) {
                        html += '<tr>';
                        html += '<td>' + new Date(data[i].time).toLocaleString() + '</td>';
                        html += '<td><button class="btn btn-sm btn-dark btnAsset" data-assetId="'+data[i].from+'" data-epoch="'+data[i].epoch+'">' + data[i].from + '</button></td>';
                        html += '<td><button class="btn btn-sm btn-dark btnAsset" data-assetId="'+data[i].to+'" data-epoch="'+data[i].epoch+'">' + data[i].to + '</button></td>';
                        html += '<td>' + (data[i].energy/1000).toFixed(3).replace('.',',') + 'kWh</td>';
                        html += '</tr>';
                    }
                    html += '</tbody>';
                    html += '</table>';
                    $('#txTable').html(html);
                    $('.btnAsset').off();
                    $('.btnAsset').click(function() {
                        balanceRetrieve($(this).attr('data-assetId'),$(this).attr('data-epoch'));
                        $('#modalStatement').modal('hide');
                    });
                });

            });
        }
        const balanceRetrieve = (assetId,epoch) => {
            window.assetId = assetId;
            window.highlightEpoch = 1 * epoch;

            $('#assetLabel').html(window.assetId);

            let epochQuery = "";
            if(epoch) {
                epochQuery = "&epoch="+epoch;
            }
            $.getJSON("/api/balancing/balance?assetId="+assetId+epochQuery,balanceRender);
        }
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
});