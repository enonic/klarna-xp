$(function () {
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

    $("body").on("click", ".open-cart-modal", function(){
        refreshCart();
        $('.ui.modal')
            .modal('show');
    });

    $(".payup-cart").on('click', '#payup-toggle-cart', function (e) {
        $(".payup-cart").toggleClass("active");
    });

    $(".cart-view").on('click', '[data-klarna-cart-remove]', function (e) {
        e.preventDefault();
        var url = $(e.currentTarget).data('payup-cart-remove');
        $.get(url).done(function (data) {
            toastr.error(data.msg, "", toastrOptions);
            refreshCart(data);
        });
    });

    $(".cart-view").on('change', '.product-quantity.cart-input', function (e) {
        e.preventDefault();
        var url = $(e.currentTarget).data('klarna-cart-update') + "&quantity="+$(this).val();
        $.get(url).done(function (data) {
            toastr.success(data.msg, "", toastrOptions);
            refreshCart(data);
        });
    });

    $(".cart-view").on("click", "[data-klarna-cart-add]",function (e) {
        e.preventDefault();
        var url = $(e.currentTarget).data('klarna-cart-add');
        var quantity = $("#qtyInput_"+$(e.currentTarget).data("klarna-product-id"));
        if(quantity.val() > 1){
            url = url.replace("quantity=1", "quantity="+quantity.val());
        }
        $.get(url).done(function (data) {
            toastr.success(data.msg, "", toastrOptions);
            refreshCart(data);
        });
    });

    $(".payup-cart").on('click', '#payup-checkout-button', function () {
        $("#payup-checkout-modal").show();
        var checkoutUrl = $("[data-payup-checkout-url]").data('payup-checkout-url');
        console.log(checkoutUrl);
        $.get(checkoutUrl).done(function (data) {
            $("#payup-checkout-modal").html(data);
            componentHandler.upgradeAllRegistered();
        });
    });

    $(".payup-cart").on('click', '.payup-checkout-close', function(e) {
        e.preventDefault();
        $("#payup-checkout-modal").hide();
    });

});

function refreshCart(data) {
    $("#cartQty").html(data.quantity)
    $(".cart-content").html($(data.cart.body).find(".cart-content").html());
}