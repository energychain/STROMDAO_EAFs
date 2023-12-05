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
    });

    $('#fetchLabels').submit(function (event) {
        event.preventDefault();
        doFetch();
    });
});