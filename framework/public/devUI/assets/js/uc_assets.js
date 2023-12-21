
$(document).ready(function() {
    const runSearch = function() {
        $('#searchResults').show();
        $('#searchResults').html('Searching...');
        $.getJSON("/api/debit/assets?q=" + $('#q').val(), function(data) {
            let html = '<table class="table table-condensed table-striped">';
            html += '<thead><tr><th>Zählerkennung</th><th>Letzte Aktualisierung</th><th>Zählerstand</th><th>Bezug</th><th>Kosten</th></tr></thead>';
            html += '<tbody>';
            for(let i=0;i<data.length;i++) {
                html += '<tr>';
                html += '<td>'+data[i].meterId+'</td>';
                html += '<td>'+new Date(data[i].clearingTime).toLocaleString()+'</td>';
                html += '<td>'+(data[i].reading/1000).toFixed(3).replace('.',',')+' kWh</td>';
                html += '<td>'+(data[i].consumption/1000).toFixed(3).replace('.',',')+' kWh</td>';
                html += '<td>'+(data[i].cost).toFixed(2).replace('.',',')+' €</td>';
                html += '</tr>';
            }
            html += '</tbody>';
            html += '</table>';
            $('#searchResults').html(html);
        });
    }

    $('#searchResults').hide();
    $('#frmMeterSearch').submit(function(e) {
        e.preventDefault();
       runSearch();
    });

    $('#q').on('change', function() {
        $('#searchResults').hide();
        $('#searchResults').html('');
    });

    setTimeout(runSearch, 1000);
});