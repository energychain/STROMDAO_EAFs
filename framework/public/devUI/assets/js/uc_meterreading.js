$(document).ready(function () {

    let customLabels = {};

    $.getJSON("/api/tariff/customLabels", function(data) {
        customLabels = data;
    });

    const fetchLastReading = function() {
        $.getJSON("/api/metering/lastReading?meterId="+$('#meterId').val(), function(data) {
            if(typeof data.time !== 'undefined') {
                renderReadings(data);
            } 
        });
    }

    $('#meterId').on('change', function() {
        if($('#meterId').val().length > 2 ) {
            fetchLastReading();
        }
    });

    const renderReadings = function(response) {
        let html = '';
        html += '<div class="card">';
        html += '    <div class="card-header text-bg-secondary">';
        html += '        <h4>Hauptzähler</h4>';
        html += '    </div>';
        html += '    <div class="card-body">';
        html += '         <h3>'+response.reading+'</h3>';
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
        $('#time').val(new Date(response.time).toISOString().substring(0,16));
        $('#reading').val(response.reading);
        $('#lastReadingTime').html(new Date(response.time).toISOString());
        $('#readings').html(html);
        $('#readings').show();
        $('#readingsBackend').show();
    }

    //Initialize Time to yesterday at same time.
    $('#time').val(new Date(new Date().getTime()-86400000).toISOString().substring(0,16));

    $('#updateReading').submit(function (event) {
        event.preventDefault();
        $('#submitReading').attr('disabled', 'disabled');
        var dataToSend = {
            meterId: $('#meterId').val(),
            time: new Date($('#time').val()+"Z").getTime() * 1,
            reading: $('#reading').val() * 1
          };
          console.log(dataToSend);
          // AJAX POST-Request
          $.ajax({
            type: 'POST',
            url: '/api/metering/updateReading', 
            data: JSON.stringify(dataToSend),
            contentType: 'application/json',
            success: function(response) {
              // Erfolgreiche Antwort vom Server
              $('#submitReading').removeAttr('disabled');
              if(response.processed) {
                    $('#successAlert').show();
                    setTimeout(function() {
                            $('#successAlert').hide();
                    },1000);

                   renderReadings(response);
              } else {
                    $('#warningAlert').show();
                    $('#vPoint').html('Warnung');
              }
            },
            error: function(error) {
                $('#dangerAlert').show();
                $('#vPoint').html('Fehler:'+error);
                $('#submitReading').removeAttr('disabled');
            }
    });     
    });

   $('.btnAddTime').on('click',function(e) {
       let time = new Date($('#time').val()+'Z').getTime() * 1;
       time += $(e.currentTarget).attr('data') * 1;
       $('#time').val(new Date(time).toISOString().substring(0,16));
   });
});