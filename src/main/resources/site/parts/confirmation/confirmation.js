var klarna = require('klarnaLib');
var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');


exports.get = function (req) {
    var view = resolve("confirmation.html");

    if(req.params.klarna_order_id) {
        var klarnaCheckout = klarna.getKlarnaCheckout(req);
        
        return {
            body: '<div class="cart column cart-view">'+klarnaCheckout.snippet+'</div>'
        }
    } else {
        return {
            body: thymeleaf.render(view, {
                message: "klarna_order_id is required to show the Confirmation Page"
            })
        }
    }
};
