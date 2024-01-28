$(document).ready(function() {

    const renderPeers = async function(assetId) {
        $.getJSON("/api/asset/get?assetId="+assetId+"&type=balance", function(data) {
            if(typeof data.balancerule !== 'undefined') {
                if(typeof data.balancerule.from !== 'undefined') {
                    $('#allocation').val(data.balancerule.from);
                    $('#direction-from').attr('checked','checked');
                }
                if(typeof data.balancerule.to !== 'undefined') {
                    $('#allocation').val(data.balancerule.to);
                    $('#direction-to').attr('checked','checked');
                }
            }
        });
        $.getJSON("/api/balancing/peers?assetId="+assetId,function(data) {
                let einspeiser_html = '<ul>';
                let bezieher_html = '<ul>';
                for(let i=0;i<data.length;i++) {
                    if(data[i].balancerule.to == assetId) {
                        einspeiser_html += '<li>'+data[i].assetId+'</li>';
                    } else if(data[i].balancerule.from == assetId) {
                        bezieher_html += '<li>'+data[i].assetId+'</li>'; 
                    }
                }
                einspeiser_html += '</ul>';
                bezieher_html += '</ul>';
                $('#einspeiser').html(einspeiser_html);
                $('#bezieher').html(bezieher_html);
        });
    }

    if($.urlParam('assetId')) {
        window.assetId = $.urlParam('assetId'); 
        renderPeers(window.assetId);
    }
    
});