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
                html += '<tr>';
                html += '<td><button class="btn btn-sm btn-dark btnTx" data-epoch="'+data[i].epoch+'" data-label="'+data[i].label+'">' + new Date(data[i].time).toLocaleString() + '</button></td>';
                html += '<td>' + customLabels[data[i].label] + '</td>';
                html += '<td>' + (data[i].in/1000).toFixed(3).replace('.',',') + 'kWh</td>';
                html += '<td>' + (data[i].out/1000).toFixed(3).replace('.',',') + 'kWh</td>';
                html += '<td>' + ((data[i].out - data[i].in)/1000).toFixed(3).replace('.',',') + 'kWh</td>';
                html += '</tr>';
            }
            html += '</tbody>';
            html += '</table>';
            $('#backBtn').attr('data-epoch',data[data.length-1].epoch);
            $('#fwdBtn').attr('data-epoch',data[0].epoch + 24);
            $('#epochbalance').html(html);
        }
        const balanceRetrieve = (assetId,epoch) => {
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
            balanceRetrieve($.urlParam('assetId'),$(this).attr('data-epoch'));
        });
        $('#fwdBtn').click(function() {
            balanceRetrieve($.urlParam('assetId'),$(this).attr('data-epoch'));
        });
    });
});