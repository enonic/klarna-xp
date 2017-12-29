var klarna = require('klarnaLib');
var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');


exports.get = function (req) {
    var view = resolve("confirmation.html");

    var returnContent;
    
    if (req.mode == "edit") {
		returnContent = "<h3>Confirmation part goes here.</h3>";
		
		return {
            body: '<div class="cart column cart-view">'+ returnContent +'</div>'
        }    		
	} else{
		if(req.params.klarna_order_id) {
			returnContent = klarna.getKlarnaCheckout(req).snippet;
			
			return {
                body: '<div class="cart column cart-view">'+ returnContent +'</div>'
            }
		}else{
			return {
	            body: thymeleaf.render(view, {
	                message: "klarna_order_id is required to show the Confirmation Page"
	            })
	        }
		}
	}
};
