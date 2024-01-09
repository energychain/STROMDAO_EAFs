
$(document).ready(function() {
    $.getJSON("/api/access/settings",function(data) {
        window.eaf_settings = data;
    });
    const renderResultSet = function(data) {
        $('#searchResults').show();
        let html = '<table class="table table-condensed table-striped">';
        html += '<thead><tr><th>Kennung</th><th>Aktualisierung</th><th>Zählerstand</th><th>Bezug</th><th>&#8960;Strompreis<th>Kosten</th></tr></thead>';
        html += '<tbody>';
        for(let i=0;i<data.length;i++) {
            html += '<tr data-id="'+data[i].meterId+'">';
            html += '<td>'+data[i].meterId+'</td>';
            html += '<td>'+new Date(data[i].clearingTime).toLocaleString()+'</td>';
            html += '<td>'+(data[i].reading/1000).toFixed(3).replace('.',',')+' kWh</td>';
            html += '<td>'+(data[i].consumption/1000).toFixed(3).replace('.',',')+' kWh</td>';
            html += '<td>'+(data[i].cost/(data[i].consumption/1000)).toFixed(4).replace('.',',')+'€</td>';
            html += '<td>'+(data[i].cost).toFixed(2).replace('.',',')+' €</td>';
            html += '<td><button class="btn btn-xs btn-dark btnClear openPWA" title="Letztverbraucher APP öffnen" data-id="'+data[i].meterId+'"><i class="fa fa-window-restore"></i></button>';
            html += '<button class="btn btn-xs btn-dark btnClear openProfile" title="Lastgangprofil öffnen" data-id="'+data[i].meterId+'"><i class="fa fa-bar-chart-o"></i></button>';
            html += '<button class="btn btn-xs btn-dark btnClear openReading" title="Zählerstandserfassung öffnen" data-id="'+data[i].meterId+'"><i class="fa fa-pencil"></i></button>';
            html += '<button class="btn btn-xs btn-dark btnClear openClearing" title="Clearing öffnen" data-id="'+data[i].meterId+'"><i class="fa fa-euro"></i></button>';
            html += '</td>';
            html += '</tr>';
        }
        html += '</tbody>';
        html += '</table>';
        $('#searchResults').html(html);
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

    }

    const runSearch = function() {
        $('#searchResults').show();
        $('#searchResults').html('Searching...');
 
        $.getJSON("/api/debit/assets?q=" + $('#searchMeter').val(), renderResultSet);
    }
    $('.delayBtn').click(function() {
        $.getJSON("/api/debit/delayed?delay="+$(this).attr('data'),renderResultSet);
    });

    $('#searchResults').hide();
    $('#frmMeterSearch').submit(function(e) {
        e.preventDefault();
       runSearch();
    });

    $('#searchMeter').on('change', function() {
        $('#searchResults').hide();
        $('#searchResults').html('');
    });
    if($.urlParam('delay')) {
        $.getJSON("/api/debit/delayed?delay="+$.urlParam('delay'),renderResultSet);
    }  else {  
        setTimeout(runSearch, 1000);
    }
    if($.urlParam('meterId')) {
        $('#searchMeter').val($.urlParam('meterId'));
    }
    if($.urlParam('q')) {
        $('#searchMeter').val($.urlParam('q'));
    }
});