$(document).ready(function () {

    let customLabels = {};

    $.getJSON("/api/tariff/customLabels", function(data) {
        customLabels = data;
    });

    const fetchApiToken = function() {
        $.getJSON("/api/access/createMeterJWT?meterId="+$('#amrMeterId').val(),function(data) {
            $('#amrToken').val(data);
            $('#amrUrl').val("http://localhost:3001/api/reading");
        })
    }

    const fetchLastReading = function() {
        $('#btnAddDemo').removeAttr('disabled');
        $('#btnAddDemo').removeClass("disabled");
        $.getJSON("/api/metering/lastReading?meterId="+$('#meterId').val(), function(data) {
            if(typeof data.time !== 'undefined') {
                $('#amrMeterId').val($('#meterId').val())
                renderReadings(data);
                fetchApiToken();
            } 
        });
    }

    $('#meterId').on('change', function() {
        if($('#meterId').val().length > 2 ) {
            fetchLastReading();
            $('#btnAddDemo').removeAttr('disabled');
            $('#btnAddDemo').removeClass("disabled");
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
        $('#time').val(new Date(response.time).toLocaleString());
        $('#reading').val(response.reading);
        $('#lastReadingTime').html('<code>'+new Date(response.time).toLocaleString()+'</code>');
        $('#readings').html(html);
        $('#readings').show();
        $('#readingsBackend').show();
    }

    //Initialize Time to yesterday at same time.
    $('#time').val(new Date(new Date().getTime()-86400000).toISOString().substring(0,16));

    $('#btnClearing').on('click',function() {
        location.href="./uc_clearing.html?meterId="+$('#meterId').val();
    }
    )

    $('#btnAddDemo').on('click',function() {
        $.getJSON("/api/demometer/populate24h?meterId="+$('#meterId').val(), function(data) {
            location.href="/devUI/uc_energyprofile.html?meterId="+$('#meterId').val();
        });
    });

    $('#updateReading').submit(function (event) {
        event.preventDefault();
        $('#submitReading').attr('disabled', 'disabled');
        var dataToSend = {
            meterId: $('#meterId').val(),
            time: new Date($('#time').val()+"Z").getTime() * 1,
            reading: $('#reading').val() * 1
          };
          // AJAX POST-Request
          $.ajax({
            type: 'POST',
            url: '/api/metering/updateReading', 
            data: JSON.stringify(dataToSend),
            contentType: 'application/json',
            success: function(response) {
              // Erfolgreiche Antwort vom Server
              $('#submitReading').removeAttr('disabled');
              $('#btnClearing').hide();
              if(response.processed) {
                    $('#successAlert').show();
                    setTimeout(function() {
                            $('#successAlert').hide();
                    },5000);
                    if(typeof response.clearing !== 'undefined') {
                        $('#btnClearing').show();
                    }
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

   $('#amr').submit(function (event) {
       event.preventDefault();
        fetchApiToken();
   })

   if($.urlParam("meterId")) {
       $('#meterId').val($.urlParam("meterId"));
       $('#searchMeter').val($.urlParam("meterId"))
       fetchLastReading();
   }
});