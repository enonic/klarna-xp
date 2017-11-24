$(document).ready(function() {
    $('.ui.dropdown.fantasy').dropdown({
        maxSelections: 1,
        forceSelection: false,
        onChange: function (value, text, $selectedItem) {
            if(!value) return;
            var $dropdown = $(this);
            $dropdown.addClass('loading');
            setTimeout(function(){
                $dropdown.removeClass('loading');
            }, 500);
        }
    });

    $('.ui.dropdown .remove.icon').on('click', function(e){
        $(this).parent('.dropdown').dropdown('clear');
        console.log('clear');
        e.stopPropagation();
    });

    var toastrOptions = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }


    $( ".fantasyForm" ).submit(function( event ) {
        var url = $(location).attr('href'); // the script where you handle the form input.
        $("[type=submit]").toggleClass("disabled");
        $("#loading").toggleClass("hidden");

        var values, index;

        // Get the parameters as an array
        values = $(this).serializeArray();

        var fantasyKey;

        for (index = 0; index < values.length; ++index) {
            if (values[index].name == "fantasyId") {
                fantasyKey = values[index].value;
                break;
            }
        }

        // Find and replace `content` if there
        for(var i = 3; i >= 1; i--){
            var fieldVal = $("#fantasy_"+fantasyKey + "_pt"+i).val();
            if(fieldVal != null && fieldVal != undefined && fieldVal != "" && fieldVal != "undefined") {
                values.push({
                    name: "pt"+i,
                    value: $("#fantasy_" + fantasyKey + "_pt"+i).val() || ""
                });
            }
        }

        // Convert to URL-encoded string
        values = jQuery.param(values);

        $.ajax({
            type: "POST",
            url: url,
            data: values, // serializes the form's elements.
            success: function(data)
            {
                $("[type=submit]").toggleClass("disabled");
                $("#loading").toggleClass("hidden");
                if(data.success){
                    toastr.success(data.message, "", toastrOptions);
                } else {
                    toastr.error(data.message, "", toastrOptions);
                }
            }
        });

        event.preventDefault();
    });

    $('.special.cards .image').dimmer({
        on: 'hover'
    });
});