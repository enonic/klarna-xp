$(document).ready(function(){
    $('.ui.dropdown').dropdown({
        maxSelections: 20,
        forceSelection: false,
    });
    $('.ui.radio.checkbox').checkbox();

    jQuery.fn.preventDoubleSubmission = function() {
        $(this).on('submit',function(e){
            var $form = $(this);

            if ($form.data('submitted') === true) {
                // Previously submitted - don't submit again
                e.preventDefault();
            } else {
                // Mark it so that the next submit can be ignored
                $form.data('submitted', true);
            }
        });

        // Keep chainability
        return this;
    };

    $('form').preventDoubleSubmission();

    $('[type=reset]').on('click', function(){
        $('form').form('reset');
        $('.ui.form .ui.dropdown').dropdown("clear");
        setTimeout(function(){
            $('.ui.form .ui.dropdown').dropdown('set selected', $("#leagueId").val());

            $('[name="connection"][value="copy"]').prop("checked", true);
            $('[name="forcePublish"][value="false"]').prop("checked", true);
        }, 100);

    });


    $( "#shareForm" ).submit(function( event ) {
        var url = $(location).attr('href'); // the script where you handle the form input.
        $("[type=submit]").toggleClass("disabled");
        $("#loading").toggleClass("hidden");
        $.ajax({
            type: "POST",
            url: url,
            data: $("#shareForm").serialize(), // serializes the form's elements.
            success: function(data)
            {
                $("#reloadBtn").toggleClass("hidden");
                $("[type=submit]").toggleClass("disabled");
                $("#loading").toggleClass("hidden");
                getLog();
            }
        });

        event.preventDefault();
    });


    function addQSParm(name, value) {
        var re = new RegExp("([?&]" + name + "=)[^&]+", "");

        function add(sep) {
            myUrl += sep + name + "=" + encodeURIComponent(value);
        }

        function change() {
            myUrl = myUrl.replace(re, "$1" + encodeURIComponent(value));
        }
        if (myUrl.indexOf("?") === -1) {
            add("?");
        } else {
            if (re.test(myUrl)) {
                change();
            } else {
                add("&");
            }
        }
    }

    var myUrl = window.location.href;
    addQSParm("function", "getLog");

    function getLog(){
        $.ajax({
            type: "GET",
            url: myUrl,
            success: function(data)
            {
                data.logs.forEach(function(logObj){
                    var tbody = "<thead><tr><th colspan='3' class='center aligned'>Sharing article log</th></tr><tr>" +
                        "<th>Date: <br/>"+logObj.date+"</th>" +
                        "<th>Connection: "+logObj.connection+"</th>" +
                        "<th>Force publish: "+logObj.forcePublish+"</th>"+
                    "</tr></thead>";
                    logObj.logs.forEach(function(logLine){
                        tbody += '<tr><td>'+logLine.club.toUpperCase()+'</td><td colspan="2">';
                        if(logLine.preview){
                            tbody += '<a href="'+logLine.preview+'" target="_blank" data-tooltip="'+logObj.clubIds[logLine.club]+'">';
                            tbody += logLine.message;
                            tbody += '</a>';
                        } else {
                            if(logObj.clubIds[logLine.club]) {
                                tbody += '<span data-tooltip="' + logObj.clubIds[logLine.club] + '">';
                            }
                            tbody += logLine.message;
                            if(logObj.clubIds[logLine.club]) {
                                tbody += '</span>'
                            }
                        }
                        tbody += "</td></tr>"
                    });

                    $('#logTable').html(tbody);
                })
            }
        });

        setTimeout(function(){
            getLog();
        }, 1000)
    }


});