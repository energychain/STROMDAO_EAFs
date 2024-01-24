
$(document).ready(function() {
    $.getJSON("/api/access/settings",function(data) {
        window.eaf_settings = data;
    });
    const renderBalancingSet = function(data) {
        if(data.length >0) {
           $('#cardBalancing').show();
        }
        $('#searchResults').show();
        let html = '<table class="table table-condensed table-striped">';
        html += '<thead><tr><th>Produkt</th><th>Von</th><th>An</th><th>Energie</th></tr></thead>';
        html += '<tbody>';
        for(let i=0;i<data.length;i++) {
            html += '<tr data-id="'+data[i].from+'">';
            html += '<td>'+data[i].epoch + '</td>';
            html += '<td>';
            html +=   '<button class="btn btn-xs btn-light btnClear openAssetBalancing" title="Bilanzierung öffnen" data-epoch="'+data[i].epoch+'" data-id="'+data[i].from+'">'+data[i].from+'</button>';
            html += '</td>';
            html += '<td>';
            html +=     '<button class="btn btn-xs btn-light btnClear openAssetBalancing" title="Bilanzierung öffnen" data-epoch="'+data[i].epoch+'" data-id="'+data[i].to+'">'+data[i].to+'</button>';
            html += '</td>';
            html += '<td>'+(data[i].energy/1000).toFixed(3).replace('.',',')+' kWh</td>';
            html += '</tr>';
        }
        html += '</tbody>';
        html += '</table>';
        $('#balancingResult').html(html);
        $('.openAssetBalancing').off();
        $('.openAssetBalancing').click(function() {
            const meterId = $(this).data('id');
            const epoch = $(this).data('epoch');
            location.href="./uc_balancing.html?assetId="+meterId+"&epoch="+epoch;
        });

    }
    const renderResultSet = function(data) {
        if(data.length >0 ) {
            $('#cardMeters').show();
        }
        $('#searchResults').show();
        let html = '<table class="table table-condensed table-striped">';
        html += '<thead><tr><th>Kennung</th><th>Aktualisierung</th><th>Zählerstand</th><th>Strommenge</th><th>&#8960;Strompreis<th>Kosten</th></tr></thead>';
        html += '<tbody>';
        for(let i=0;i<data.length;i++) {
            html += '<tr data-id="'+data[i].meterId+'">';
            html += '<td>'+data[i].meterId+'</td>';
            html += '<td>'+new Date(data[i].clearingTime).toLocaleString()+'</td>';
            html += '<td>'+(data[i].reading/1000).toFixed(3).replace('.',',')+' kWh</td>';
            html += '<td>'+(data[i].consumption/1000).toFixed(3).replace('.',',')+' kWh</td>';
            html += '<td>'+(data[i].cost/(data[i].consumption/1000)).toFixed(4).replace('.',',')+'€</td>';
            html += '<td>'+(data[i].cost).toFixed(2).replace('.',',')+' €</td>';
            html += '<td><button class="btn btn-xs btn-light btnClear openPWA" title="Letztverbraucher APP öffnen" data-id="'+data[i].meterId+'"><i class="fa fa-window-restore"></i></button>';
            html += '<button class="btn btn-xs btn-light btnClear openProfile" title="Lastgangprofil öffnen" data-id="'+data[i].meterId+'"><i class="fa fa-bar-chart-o"></i></button>';
            html += '<button class="btn btn-xs btn-light btnClear openReading" title="Zählerstandserfassung öffnen" data-id="'+data[i].meterId+'"><i class="fa fa-pencil"></i></button>';
            html += '<button class="btn btn-xs btn-light btnClear openClearing" title="Clearing öffnen" data-id="'+data[i].meterId+'"><i class="fa fa-euro"></i></button>';
            html += '<button class="btn btn-xs btn-light btnClear openBalancing" title="Bilanzierung öffnen" data-id="'+data[i].meterId+'"><i class="fa fa-balance-scale"></i></button>';
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
        $('.openBalancing').off();
        $('.openBalancing').click(function() {
            const meterId = $(this).data('id');
            location.href="./uc_balancing.html?assetId="+meterId;
        });

    }

    const runSearch = function() {
       // $('#cardMeters').hide(); Zero results will make it impossible to add a meter manually.
       // $('#cardBalancing').hide();

        $('#searchResults').show();
        $('#searchResults').html('Searching...');
        $('#balancingResult').html('...');
 
        $.getJSON("/api/debit/assets?q=" + $('#searchMeter').val(), renderResultSet);
        $.getJSON("/api/assets/find?q=" + $('#searchMeter').val(), renderBalancingSet);

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