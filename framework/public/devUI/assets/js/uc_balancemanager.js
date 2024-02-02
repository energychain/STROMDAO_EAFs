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

    window.rects = {};
    const COL_WIDTH = 200;
    const ROW_HEIGHT = 100;
    const COL1 = 10;
    const COL2 = COL1 + COL_WIDTH;
    const COL3 = COL2 + COL_WIDTH;
    const ROW1 = 10;
    const ROW1_5 = ROW1 + (ROW_HEIGHT/2);
    const ROW2 = ROW1 + ROW_HEIGHT;

    const initGraph = function() {
        var namespace = joint.shapes;

        var graph = new joint.dia.Graph({}, { cellNamespace: namespace });

        var paper = new joint.dia.Paper({
            el: document.getElementById('graphBLK'),
            model: graph,
            width: '100%',
            height: 600,
            gridSize: 1,
            cellViewNamespace: namespace
        });

        var rect = new joint.shapes.standard.Rectangle();
        rect.position(COL2, ROW1_5);
        rect.resize(150, 40);
        rect.attr({
            body: {
                fill: 'orange'
            },
            label: {
                text: window.assetId,
                fill: 'black'
            }
        });
        rect.addTo(graph);
        window.rects[window.assetId] = rect;

        // Render Connections
        $.getJSON("/api/asset/get?assetId="+assetId+"&type=balance", function(data) {
            if(typeof data.balancerule !== 'undefined') {
                let label_from = 'eaf_generic_balancegroup'
                if(typeof data.balancerule.from !== 'undefined') {
                    label_from = data.balancerule.from;
                }
                var rect2 = rect.clone();
                rect2.position(COL1, ROW1);
                rect2.attr({
                    body: {
                        fill: 'grey'
                    },
                    label: {
                        text: label_from,
                        fill: 'white'
                    }
                });

                rect2.addTo(graph);
                var link2 = new joint.shapes.standard.Link();
                link2.source(rect2);
                link2.target(rect);
                link2.addTo(graph);

                let label_to = 'eaf_generic_balancegroup'
                if(typeof data.balancerule.to !== 'undefined') {
                    label_to = data.balancerule.to;
                }
                var rect3 = rect.clone();
                rect3.position(COL1, ROW2);
                rect3.attr({
                    body: {
                        fill: 'green'
                    },
                    label: {
                        text: label_to,
                        fill: 'white'
                    }
                });
                rect3.addTo(graph);
                var link = new joint.shapes.standard.Link();
                link.source(rect);
                link.target(rect3);
                link.addTo(graph);
                
            }
        });
        
        $.getJSON("/api/balancing/peers?assetId="+assetId+"", function(data) {
            for(let i=0;i<data.length;i++) {
                if(typeof data[i].balancerule !== 'undefined') {
                    if(typeof data[i].balancerule.to !== 'undefined') {
                        const rect2 = rect.clone();
                        rect2.position(COL3, ROW1 + (i*ROW_HEIGHT) );
                        rect2.attr({
                            body: {
                                fill: 'grey'
                            },
                            label: {
                                text: data[i].assetId,
                                fill: 'white'
                            }
                        });

                        rect2.addTo(graph);
                        const link2 = new joint.shapes.standard.Link();
                        link2.source(rect2);
                        link2.target(rect);
                        link2.addTo(graph);
                    }
                    if(typeof data[i].balancerule.from !== 'undefined') {
                        const rect3 = rect.clone();
                        rect3.position(COL3, ROW1 + (i*ROW_HEIGHT));
                        rect3.attr({
                            body: {
                                fill: 'green'
                            },
                            label: {
                                text: data[i].assetId,
                                fill: 'white'
                            }
                        });
                        rect3.addTo(graph);
                        const link3 = new joint.shapes.standard.Link();
                        link3.source(rect);
                        link3.target(rect3);
                        link3.addTo(graph);
                    }
                }
            }
        });
        
    }
   
    if($.urlParam('assetId')) {
        window.assetId = $.urlParam('assetId'); 
        //renderPeers(window.assetId);
        initGraph();
    }
    
});