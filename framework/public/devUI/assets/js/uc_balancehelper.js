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
                window.peersFrom = {};
                window.peersTo = {};

                let einspeiser_html = '<ul>';
                let bezieher_html = '<ul>';
                for(let i=0;i<data.length;i++) {
                    if(data[i].balancerule.to == assetId) {
                        einspeiser_html += '<li><btn class="btn btn-light removeAsset" date-assetId="'+data[i].assetId+'">'+data[i].assetId+'</button></li>';
                        window.peersFrom[data[i].assetId] = true;
                    } else if(data[i].balancerule.from == assetId) {
                        bezieher_html += '<li><btn class="btn btn-light removeAsset" date-assetId="'+data[i].assetId+'">'+data[i].assetId+'</button></li>'; 
                        window.peersTo[data[i].assetId] = true;
                    }
                }
                einspeiser_html += '</ul>';
                bezieher_html += '</ul>';
                $('#einspeiser').html(einspeiser_html);
                $('#bezieher').html(bezieher_html);
                $('.removeAsset').off();
                $('.removeAsset').click(function() {
                    let balancerule = {};

                    balancerule["from"] = "eaf_generic_balancegroup";

                    $.ajax({
                        type: 'POST',
                        url: '/api/asset/upsert', 
                        data: JSON.stringify({
                            assetId: $(this).attr('date-assetId'),
                            type: 'balance', //realy? maybe we could split here
                            balancerule: balancerule
                        }),
                        contentType: 'application/json',
                        success: function(response) {
                            renderPeers(window.assetId);
                        }
                    });  
                });
        });
    }

    const addBalanceRule = function (assetId,rule) {
        let balancerule = {};

        balancerule[rule] = window.assetId;
        console.log(balancerule);
        $.ajax({
            type: 'POST',
            url: '/api/asset/upsert', 
            data: JSON.stringify({
                assetId: assetId,
                type: 'balance', //realy? maybe we could split here
                balancerule: balancerule
            }),
            contentType: 'application/json',
            success: function(response) {
                renderPeers(window.assetId);
            }
        });    
    }

    $('#searchForm').submit(function(e) {
        e.preventDefault();
        $.getJSON("/api/metering/assets?q="+$('#addSearch').val(), function(data) {
            let html = '';
            html +=  '<div class="row" style="margin-top:25px">';
            html += '<div class="col"><h3>Einspeiser</h3></div>';
            html += '<div class="col"><h3>Bezieher</h3></div>';
            html += '</div>';

            for(let i=0;i<data.length;i++) {
                html += '<p>'+data[i].meterId+'</p>';
                html += '<div class="row" style="margin-bottom:15px">';
                let state = "";
                if(typeof window.peersFrom[data[i].meterId] !== 'undefined') {
                    state = " disabled='disabled' ";
                }
                html += '<div class="col"><button class="btn btn-dark btnAddEinspeiser" '+state+' data-assetId="'+data[i].meterId+'"><i class="fa fa-plus-square"></i></button></div>';
                state = "";
                if(typeof window.peersTo[data[i].meterId] !== 'undefined') {
                    state = " disabled='disabled' ";
                }
                html += '<div class="col"><button class="btn btn-dark btnAddBezieher" '+state+' data-assetId="'+data[i].meterId+'"><i class="fa fa-plus-square"></i></button></div>';
                html += '</div>';
            }
            $('#addSearchResult').html(html);
            $('.btnAddEinspeiser').off();
            $('.btnAddEinspeiser').click(function() {
                addBalanceRule($(this).attr('data-assetId'),'to');
            });
            $('.btnAddBezieher').off();
            $('.btnAddBezieher').click(function() {
                addBalanceRule($(this).attr('data-assetId'),'from');
            });
        });     
    });
    if($.urlParam('assetId')) {
        window.assetId = $.urlParam('assetId'); 
        renderPeers(window.assetId);
    }
    
});