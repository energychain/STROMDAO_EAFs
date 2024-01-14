$(document).ready(function() {
    const balanceRender = (data) => {
        let html = '<table class="table table-condensed table-striped">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Zeitpunkt</th>';
     //   html += '<th>Segment</th>';
        html += '<th>Lieferung</th>';
        html += '<th>Einspeisung</th>';
        html += '<th>Saldo</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        for(let i=0;i<data.length;i++) {
            html += '<tr>';
            html += '<td>' + new Date(data[i].time).toLocaleString() + '</td>';
    //        html += '<td>' + data[i].label + '</td>';
            html += '<td>' + (data[i].in/1000).toFixed(3).replace('.',',') + 'kWh</td>';
            html += '<td>' + (data[i].out/1000).toFixed(3).replace('.',',') + 'kWh</td>';
            html += '<td>' + ((data[i].out - data[i].in)/1000).toFixed(3).replace('.',',') + 'kWh</td>';
            html += '</tr>';
        }
        html += '</tbody>';
        html += '</table>';
        $('#epochbalance').html(html);
    }
    const balanceRetrieve = (assetId) => {
        $.getJSON("/api/balancing/balance?assetId="+assetId,balanceRender);
    }
    if($.urlParam('assetId')) {
        balanceRetrieve($.urlParam('assetId'));
    } else {
        balanceRetrieve('eaf_general');
    }
});