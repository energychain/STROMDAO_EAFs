
$(document).ready(function() {
    $.urlParam = function (name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                          .exec(window.location.search);
    
        return (results !== null) ? results[1] || 0 : false;
    }
    $.getJSON("/api/settings",function(data) {
            for (const [key, value] of Object.entries(data)) { 
                $(".meta_value_"+key).html(value);
                $(".meta_visibility_"+key).show();
            }
    });
})