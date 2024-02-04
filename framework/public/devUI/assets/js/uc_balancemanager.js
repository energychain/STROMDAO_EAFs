window.rects = {};
const COL_WIDTH = 200;
const ROW_HEIGHT = 60;
const COL1 = 10;
const COL2 = COL1 + COL_WIDTH;
const COL3 = COL2 + COL_WIDTH;
const COL4 = COL3 + COL_WIDTH;
const ROW1 = 10;
const ROW2 = ROW1 + ROW_HEIGHT;

const initGraph = function() {
    var namespace = joint.shapes;

    var graph = new joint.dia.Graph({}, { cellNamespace: namespace });

    window.paper = new joint.dia.Paper({
        el: document.getElementById('graphBLK'),
        model: graph,
        width: '100%',
        height: 290,
        gridSize: 1,
        cellViewNamespace: namespace
    });

    var rect = new joint.shapes.standard.Rectangle();
    rect.position(COL2, ROW2);
    rect.resize(180, 40);
    rect.attr({
        body: {
            fill: 'white'
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
                    fill: 'black'
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
                    fill: 'grey'
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
        let colx = COL3;
        let coly = ROW1;
        for(let i=0;i<data.length;i++) {
            if(typeof data[i].balancerule !== 'undefined') {
                if(typeof data[i].balancerule.to !== 'undefined') {
                    const rect2 = rect.clone();
                    rect2.position(colx, coly);
                    rect2.attr({
                        body: {
                            fill: 'red'
                        },
                        label: {
                            text: data[i].assetId,
                            fill: 'black'
                        }
                    });

                    rect2.addTo(graph);
                    const link2 = new joint.shapes.standard.Link();
                    link2.source(rect2);
                    link2.target(rect);
                    link2.addTo(graph);
                    coly += ROW_HEIGHT;
                    if(coly > ROW_HEIGHT * 3) {
                        coly = ROW1;
                        colx += COL_WIDTH;
                    }
                }
                if(typeof data[i].balancerule.from !== 'undefined') {
                    const rect3 = rect.clone();
                    rect3.position(colx,coly);
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
                    coly += ROW_HEIGHT;
                    if(coly > ROW_HEIGHT * 3) {
                        coly = ROW1;
                        colx += COL_WIDTH;
                    }
                }
            }
        }
        window.paper.scaleContentToFit({ padding: 10 });
        window.paper.on('cell:pointerdown', 
            function(cellView, evt, x, y) { 
                location.href="?assetId="+cellView.model.attributes.attrs.label.text;
            }
        );
    });
    
}

$(document).ready(function() {
    if($.urlParam('assetId')) {
        window.assetId = $.urlParam('assetId'); 
        //renderPeers(window.assetId);
        $('#searchMeter').val(window.assetId);
        initGraph();
    }
    
});

$(window).on('resize', joint.util.debounce(function() {
    window.paper.scaleContentToFit({ padding: 10 });
}));