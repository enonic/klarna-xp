var klarna = require('klarnaLib');
var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');


exports.get = function (req) {
	
	var returnContent;
	
	if (req.mode == "edit") {
		returnContent = "<h3>Checkout part goes here.</h3>";
	} else{
		returnContent = klarna.getKlarnaCheckout(req).snippet;
	}
	
    return {
        body: '<div class="cart column cart-view">'+ returnContent +'</div>'
    }
};
