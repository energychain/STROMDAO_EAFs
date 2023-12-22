
$(document).ready(function() {
    $('#frmConcentrator').submit(function(event) {
        event.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/api/access/createConcentratorJWT', 
            data: JSON.stringify({
                concentratorId: $('#concentratorId').val(),
            }),
            contentType: 'application/json',
            success: function(response) {
                $('#token').val(response);
                 console.log(response);
            },
            error: function(error) {
                console.error(error);
            }
        });   
    });
});