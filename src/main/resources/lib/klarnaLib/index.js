var cartLib = require('cartLib');
var customerLib = require('customerLib');
var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var contentHelper = require('contentHelper');
var klarnaOrderClass = Java.type("no.seeds.klarna.Checkout");
var intClass = Java.type("java.lang.Integer");

module.exports = {
    context: getContext,
    getKlarnaCheckout: getKlarnaCheckout
};

function getKlarnaOrderId(filePath){
    var tmpPath = filePath.replace(/.*\//, "");
    return tmpPath;
}

function getContext(req) {
    var context = {};
    context.customer = customerLib.getCustomer();
    // CUSTOMER CART DISABLED
    //if (!context.customer) {
    log.info(req.cookies.JSESSIONID);
    context.cart = cartLib.getCartFromSession(req.cookies.JSESSIONID);
    //} else {
    //  context.cart = cartLib.getCartFromCustomer(context.customer);
    //}
    context.cartItems = cartLib.getCartItems(context.cart);
    context.cartItemsTotal = getItemCount(context.cartItems);
    context.cartTotal = getTotalPrice(context.cartItems);
    context.req = req;

    var contextDebug = {
        method: req.method,
        url: req.url,
        session: req.cookies.JSESSIONID,
        customer: context.customer ? context.customer._name : 'no-customer',
        cart: context.cart ? context.cart._id : 'no-cart'
    };

    //log.info("**** CONTEXT ****");
    //log.info(JSON.stringify(contextDebug, null, 2));
    return context;
}

function getCartContent(content_id, klarna_order_id){
    var site = portal.getSite();
    var queryString = "_path LIKE '/content"+site._path+"/*' " +
        "AND (_id = '"+content_id+"' " +
        "OR data.klarna_order_id = '"+klarna_order_id+"')";
    log.info(queryString)
    var cartContent = contentLib.query({
        query: queryString,
        contentTypes: [app.name+":cart"]
    });

    return cartContent.hits[0];
}

function updateContext(req, klarna_order_id, order_status) {
    var content_id;
    var siteConfig = portal.getSiteConfig();
    var context = getContext(req);
    var currentPage = portal.getContent();
    if (context) {
        if (context.cart) {
            if (context.cart._id) {
                content_id = context.cart._id;
            }
        }
    }

    var cartContent = getCartContent(content_id, klarna_order_id);
    if(cartContent) {
        var editorObject = {
            id: cartContent._id,
            editor: function (c) {
                c.data.klarna_order_id = klarna_order_id;
                c.data.status = order_status;
                return c;
            }
        }
        cartContent = contentHelper.modifyContent(editorObject);

        log.info(order_status)
        if ((order_status == "checkout_complete" || order_status == "created") && siteConfig.page_confirmation == currentPage._id) {
            editorObject.targetPath = "/orders";
        }

        cartContent = contentHelper.modifyContent(editorObject);
    }
}

function getItemCount(cartItems) {
    if (!cartItems) return 0;
    var itemCount = 0;
    cartItems.forEach(function (item) {
        itemCount = itemCount + item.quantity;
    });
    return itemCount;
}

function getTotalPrice(cartItems) {
    if (!cartItems) return 0;
    var totalPrice = 0;
    cartItems.forEach(function (item) {
        totalPrice += item.price;
    });
    return totalPrice;
}


function getKlarnaCheckout(req){
    var context = getContext(req);
    var klarnaOrder = new klarnaOrderClass();
    var site = portal.getSite();
    var settings = portal.getSiteConfig();

    var merchant = {
        "id": settings.merchant_id,
        "back_to_store_uri": portal.pageUrl({
            id: site._id,
            type: "absolute"
        }),
        "terms_uri": portal.pageUrl({
            id: settings.page_terms,
            type: "absolute"
        }),
        "checkout_uri": portal.pageUrl({
            id: settings.page_checkout,
            type: "absolute"
        }),
        "confirmation_uri": portal.pageUrl({
            id: settings.page_confirmation,
            type: "absolute"
        }) + "?klarna_order_id={checkout.order.uri}",
        "push_uri": portal.serviceUrl({
            service: "push",
            type: "absolute"
        }) + "?klarna_order_id={checkout.order.uri}"
    }

    klarnaOrder.setMerchant(__.toScriptValue(merchant));
    klarnaOrder.setSecretKey(settings.secret_key);
    klarnaOrder.setLocale("nb-no");
    klarnaOrder.setPurchaseCountry(settings.purchase_country);
    klarnaOrder.setPurchaseCurrency(settings.purchase_currency);

    var klarnaReturn;
    if(req.params.klarna_order_id){
        var klarna_order_id = getKlarnaOrderId(req.params.klarna_order_id);
        klarnaReturn = JSON.parse(klarnaOrder.getOrderData(klarna_order_id));
    } else {
        context.cartItems.forEach(function (item) {
            var unit_price = ((item.product.data.unit_price * 100).toFixed(0));
            var tax_rate = ((item.product.data.tax_rate * 100).toFixed(0));
            var discount_rate = ((item.product.data.discount_rate * 100).toFixed(0));

            var klarnaProduct = {
                "quantity": item.quantity,
                "reference": item.product._id,
                "name": item.product.displayName,
                "unit_price": new intClass(unit_price),
                "discount_rate": new intClass(discount_rate),
                "tax_rate": new intClass(tax_rate)
            }

            klarnaOrder.addProduct(__.toScriptValue(klarnaProduct));
        });

        //klarna iframe
        klarnaReturn = JSON.parse(klarnaOrder.getOrderData());
    }
    log.info(klarnaReturn.id + " - "+ klarnaReturn.status);

    updateContext(req, klarnaReturn.id, klarnaReturn.status);
    return klarnaReturn;
}