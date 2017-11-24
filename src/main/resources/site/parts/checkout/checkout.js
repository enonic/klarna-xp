var klarna = require('klarnaLib');
var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');


exports.get = function (req) {
    return {
        body: '<div class="cart column cart-view">'+klarna.getKlarnaCheckout(req).snippet+'</div>'
    }
};
