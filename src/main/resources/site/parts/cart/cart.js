var klarna = require('klarnaLib');
var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');

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

exports.get = function (req) {
    var settings = portal.getSiteConfig();
    var site = portal.getSite();
    var model = {};
    var context = klarna.context(req);
    model.itemCount = context.cartItemsTotal;
    model.componentUrl = portal.componentUrl({});
    model.cart = context.cart;
    model.items = appendRemoveFromCartLink(context.cartItems);
    model.totalPrice = getPrice(context.cartTotal);
    model.currency = currencyMap[settings.purchase_currency];

    model.checkoutUrl = portal.pageUrl({
        id: settings.page_checkout,
        type: "absolute"
    });

    model.backToStore = portal.pageUrl({
        id: site._id,
        type: "absolute"
    });

    return {
        body: thymeleaf.render(resolve('cart.html'), model)
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