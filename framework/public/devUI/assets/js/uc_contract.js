$(document).ready(function() {
    $('#frmMO').submit(function(e) {
            e.preventDefault();

            $('#btnSubmit').attr('disabled','disabled');
            const contract = {
                'assetId': $('#assetId').val(),
                'partnerId': $('#partnerId').val(),
                'direction': $("input[name='direction']:checked").val(),
                'load_min': $('#load_min').val(),
                'load_max': $('#load_max').val(),
                'energy': $('#energy').val(),
                'balanced':0,
                'status':'active',
                'fulfillment': $('#fulfillment').val(),
                'lastClearedEpoch':0
            };

            $.ajax({
                type: 'POST',
                url: '/api/contract/add', 
                data: JSON.stringify(contract),
                contentType: 'application/json',
                success: function(response) {
                    // Set Counter Rule
                    console.log(response);
                    $('#frmMO').reset();
                    $('#btnSubmit').removeAttr('disabled');
                }
            });     
    });
    if($.urlParam('assetId')) {
        window.assetId = $.urlParam('assetId'); 
        $('#assetId').val(window.assetId);
        $('.assetId').html(window.assetId);
    }
});