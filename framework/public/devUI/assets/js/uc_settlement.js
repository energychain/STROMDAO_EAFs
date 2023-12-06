$(document).ready(function() {
    let customLabels = {};

    $.getJSON("/api/tariff/customLabels", function(data) {
        customLabels = data;
    });

    $('#startTime').val(new Date(new Date().getTime()).toISOString().substring(0,16));
    $('#endTime').val(new Date(new Date().getTime()+1*60*60*1000).toISOString().substring(0,16));

    const doFetch = function() {
        var dataToSend = {
            consumption: $('#consumption').val() * 1,
            startTime: new Date($('#startTime').val()+"Z").getTime() * 1,
            endTime: new Date($('#endTime').val()+"Z").getTime() * 1
          };
          // AJAX POST-Request
          $.ajax({
            type: 'POST',
            url: '/api/settlement/retrieve', 
            data: JSON.stringify(dataToSend),
            contentType: 'application/json',
            success: function(response) {
                let html = '';
                html += '<div class="card">';
                html += '    <div class="card-header text-bg-secondary">';
                html += '        <h4>Gesamt</h4>';
                html += '    </div>';
                html += '    <div class="card-body">';
                html += '         <h3>'+$('#consumption').val()+'</h3>';
                html += '     </div>';
                html += '</div>';
        
                for (const [key, value] of Object.entries(response)) {
                    if(key.indexOf("irtual_") == 1) {
                      html += '<div class="card">';
                      html += '    <div class="card-header text-bg-secondary">';
                      let displayLabel = key;
                      if(typeof customLabels[key] !== 'undefined') {
                          displayLabel = customLabels[key];
                      }
                      html += '        <h4>'+displayLabel+'</h4>';
                      html += '    </div>';
                      html += '    <div class="card-body">';
                      html += '         <h3>'+value+'</h3>';
                      html += '     </div>';
                      html += '</div>';
                    }
                }
               
                $('#settlements').html(html);
                $('#settlements').show();
                $('#settlementBackend').show();
            },
            error: function(error) {
               console.error(error);
            }
    });     
    }


    $('#fetchSettlement').submit(function (event) {
        event.preventDefault();
        doFetch();
    });

});