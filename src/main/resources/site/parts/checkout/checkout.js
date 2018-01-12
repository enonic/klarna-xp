var klarna = require('klarnaLib');
var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');


exports.get = function (req) {
	
	var returnContent;
	
	if (req.mode == "edit") {
		returnContent = "<h3>Checkout part goes here.</h3>";
	} else{
		returnContent = klarna.getKlarnaCheckout(req).snippet;
		
		if (!returnContent)
			returnContent = "<h3>Invalid Merchant info. Please check your Klarna settings in the app config.</h3>"		
	}
	
    return {
        body: '<div class="cart column cart-view">'+ returnContent +'</div>'
    }
};
