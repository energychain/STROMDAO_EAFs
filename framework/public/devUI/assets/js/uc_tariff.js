$(document).ready(function () {
    const doFetch = function() {
        $.getJSON("/api/tariff/labels?startTime="+new Date($('#time').val()+"Z").getTime(), function(data) {
            let html = '<table class="table table-condensed">';
            for(let i=0;i<data.length;i++) {
                    let displayLabel = data[i].label;
                    if(typeof customLabels[data[i].label] !== 'undefined') {
                        displayLabel = customLabels[data[i].label];
                    }
                    html += '<tr><td>'+new Date(data[i].time).toLocaleString()+'</td><td>'+displayLabel+'</td></tr>';
            }
            html += '</table>';
            $('#tariffsBackend').html(html);
            $('#tariffsBackend').show();
        })
    }

    $('#time').val(new Date(new Date().getTime()).toISOString().substring(0,16));
    let customLabels = {};

    $.getJSON("/api/tariff/customLabels", function(data) {
        customLabels = data;
        doFetch();
        let html = '';
        for (const [key, value] of Object.entries(data)) {
            html += '<div class="input-group" style="margin-bottom: 15px;">';
            html += '<span class="input-group-text col-3">'+value+'</span>';
            html += '<input class="form-control" type="number" step="0.01" min="0.01" name="'+key+'"  id="'+key+'" required/>';
//            html += '<button class="btn btn-primary" type="button">Speichern</button>';
            html += '</div>';
        }
        $('#tariffPrices').html(html);
    });

    $('#frmPrices').submit(function(event) {
        event.preventDefault();
        var dataToSend = {};
        for (const [key, value] of Object.entries(customLabels)) {
            dataToSend[key] = $('#'+key).val()
        }
        $.ajax({
            type: 'POST',
            url: '/api/tariff/setPrices', 
            data: JSON.stringify(dataToSend),
            contentType: 'application/json',
            success: function(response) {
                 console.log(response);
            },
            error: function(error) {
                console.error(error);
            }
        });   
    });

    $('#fetchLabels').submit(function (event) {
        event.preventDefault();
        doFetch();
    });
});