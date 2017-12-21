var cartLib = require('cartLib');
var klarna = require('klarnaLib');
var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');

exports.get = actionSelector;
exports.post = actionSelector;

var currencyMap = {
    "EUR": "€",
    "NOK": "kr",
    "DKK": "kr",
    "SEK": "kr"
};

function getPrice(price){
    var siteConfig = portal.getSiteConfig();

    var price = price;

    price = currencyMap[siteConfig.purchase_currency] + " " + price.toFixed(2);

    return price;
}

function getCartView(req) {
    var settings = portal.getSiteConfig();
    var site = portal.getSite();

    var model = {};
    var context = klarna.context(req);
    model.itemCount = context.cartItemsTotal;
    model.componentUrl = portal.componentUrl({});
    model.cart = context.cart;
    model.items = appendRemoveFromCartLink(context.cartItems);
    model.totalPrice = getPrice(context.cartTotal);
    model.backToStore = portal.pageUrl({
        id: site._id,
        type: "absolute"
    });
    model.checkoutUrl = portal.pageUrl({
        id: settings.page_checkout,
        type: "absolute"
    });

    return {
        body: thymeleaf.render(resolve('/parts/cart/cart.html'), model)
    }
};

function appendRemoveFromCartLink(items) {
    items.forEach(function (item) {
        item.removeFromCart = portal.serviceUrl({
            service: 'cart',
            params: {
                action: 'remove',
                productId: item.product._id,
                quantity: 1
            }
        });

        item.addToCart = portal.serviceUrl({
        	service: 'cart',
            params: {
                action: 'addQty',
                productId: item.product._id,
                quantity: 1
            }
        });

        item.updateQuantity = portal.serviceUrl({
            service: 'cart',
            params: {
                action: 'updateQty',
                productId: item.product._id
            }
        });
    });
    return items;
}

function actionSelector(req) {
    var context = klarna.context(req);

    var msg = "";
    var toastrType, quantity;
    switch (req.params.action) {
        case 'remove':
            if (!context.cart) {
                context.cart = cartLib.createCart(context);
            }
            cartLib.removeFromCart(context.cart._id, req.params.quantity, req.params.productId);
            msg = "Product removed from cart";
            toastrType = "error";
            context = klarna.context(req);
            quantity = context.cartItemsTotal.toFixed(0);
            break;
        case 'addQty':
        	if (!context.cart) {
                context.cart = cartLib.createCart(context);
            }
            cartLib.addToCartQuantity(context.cart._id, req.params.quantity, req.params.productId);
            msg = "Product added to cart";
            toastrType = "success";
            context = klarna.context(req);
            
            if (context.cartItemsTotal.toFixed(0) == 0)
            	quantity = req.params.quantity;
            
            else
            	quantity = context.cartItemsTotal.toFixed(0);
            
            break;
        case "updateQty":
            if (!context.cart) {
                context.cart = cartLib.createCart(context);                
            }
            if(parseInt(req.params.quantity) < 0) {
            	msg = "Invalid quantity value!";
                toastrType = "error";
            	
            } else if(parseInt(req.params.quantity) == 0) {
                cartLib.removeFromCart(context.cart._id, "all", req.params.productId);
                msg = "Product removed from cart!";
                toastrType = "success";
            } else {
                cartLib.updateCartQuantity(context.cart._id, req.params.quantity, req.params.productId);
                msg = "Product quantity updated!";
                toastrType = "success";
            }
            
            context = klarna.context(req);
            quantity = context.cartItemsTotal.toFixed(0);
            break;
    }
    
	return {
        contentType: "application/json",
        body: {
            type: toastrType,
            quantity: quantity,
            msg: msg,
            cart: getCartView(req)
        }
    }
}