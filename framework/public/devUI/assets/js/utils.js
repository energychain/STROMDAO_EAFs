$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}

$('#helpButton').click(function() {
    $('#helpBar').offcanvas("toggle");
})

const onlineHelp = function() {
    let helpCache = window.localStorage.getItem("helpCache");
    if((typeof helpCache == 'undefined') || (helpCache == null)) {
        $.getJSON("/api/wikihelp/assets", function(data) {
            window.localStorage.setItem("helpCache", JSON.stringify(data));
            onlineHelp();
        });
    } else {
        const url = window.location.href;
        const urlObject = new URL(url);
        const filenameExt = urlObject.pathname.split('/').pop();
        const parts = filenameExt.split('.');

        // Letztes Element aus dem Array entfernen
        parts.pop();
      
        // Array von Dateinamen wieder zu einem String zusammenfügen
        const filename = parts.join('.');

        $('#helpButton').removeAttr("disabled");
        $('#helpButton').removeClass('disabled');

        helpCache = JSON.parse(helpCache);
        let html = '';
        let highTags = [];

        if(typeof helpCache[filename] !== 'undefined') {
        
            html += '<a class="list-group-item list-group-item-action py-3 lh-tight helpOpen" href="#" data-help="'+filename+'" aria-current="true">';
            html += '<div class="d-flex justify-content-between align-items-center w-100"><strong class="mb-1">'+helpCache[filename].title+'</strong></div>';
            html += '</a>';
            if(typeof helpCache[filename].tags !== 'undefined') {
                highTags = helpCache[filename].tags;
            }
        }
        for(let j=0;j<highTags.length;j++) {
            for (const [key, value] of Object.entries(helpCache)) {
                if(key !== filename) {
                    if(typeof value.tags !== 'undefined') {
                        for(let k=0;k<value.tags.length;k++) {
                            if(value.tags[k] == highTags[j]) {
                                html += '<a class="list-group-item list-group-item-action py-3 lh-tight helpOpen" data-help="'+key+'" href="#" aria-current="true">';
                                html += '<div class="d-flex justify-content-between align-items-center w-100"><strong class="mb-1">'+value.title+'</strong></div>';
                                html += '</a>';
                            }
                        }
                    }
                }
            }
        }
        $('#helpGroup').html(html);
        $('.helpOpen').click(function(e) {
                $.ajax({
                    url: '/api/wikihelp/get?name='+$(this).data('help'),
                    dataType: 'text',
                    success: function(data) {
                      $("#markdownhelp").html(marked.parse(data));
                      $('#helpTitle').html(e.currentTarget.text);
                      $('#modalHelp').modal('show');
                      console.log(data);
                    },
                    error: function(error) {
                      console.error(error);
                    }
                });
        })
    }
}
onlineHelp();