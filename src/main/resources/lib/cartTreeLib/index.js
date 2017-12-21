// This lib was created with the intent of saving the shopping carts and orders inside the Enonic Content Tree. 
// It uses functions from the content lib, instead of the node lib, manipulating then the nodes present in the Content Studio. 

var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var contentHelper = require('contentHelper');

module.exports = {
    getCartFromCustomer: getCartFromCustomer,
    getCartFromSession: getCartFromSession,
    addToCartQuantity: addToCartQuantity,
    updateCartQuantity: updateCartQuantity,
    removeFromCart: removeFromCart,
    getCartItems: getCartItems,
    archiveCart: archiveCart,
    createCart: createCart
};

function addToCartQuantity(cartId, quantity, productId) {
    if (!cartId) throw "Cannot add to cart. Missing parameter: cartId";
    if (!quantity) throw "Cannot add to cart. Missing parameter: quantity";
    if (!productId) throw "Cannot add to cart. Missing parameter: productId";

    function editor(c) {
        var currentData = c.data.items;

        if (!currentData) {
            c.data.items = {
                "product": productId,
                "quantity": quantity
            }
        } else {
            if (!Array.isArray(c.data.items)) {
                if (c.data.items.product == productId) {
                    var currentQuantity = parseInt(c.data.items["quantity"]);
                    c.data.items["quantity"] = currentQuantity + parseInt(quantity);
                } else {
                    var array = [];
                    array.push(c.data.items);
                    array.push({
                        "product": productId,
                        "quantity": quantity
                    });
                    c.data.items = array;
                }
            } else {
                var exists = false;
                c.data.items.forEach(function(item) {
                    if (item.product == productId) {
                        var currentQuantity = parseInt(item.quantity);
                        item.quantity = currentQuantity + parseInt(quantity);
                        exists = true;
                    }
                });
                if (!exists) {
                    c.data.items.push({
                        "product": productId,
                        "quantity": quantity
                    })
                }
            }
        }
        return c;
    }

    contentHelper.modifyContent({
        id: cartId,
        editor: editor
    });
}

function updateCartQuantity(cartId, quantity, productId) {
    if (!cartId) throw "Cannot add to cart. Missing parameter: cartId";
    if (!quantity) throw "Cannot add to cart. Missing parameter: quantity";
    if (!productId) throw "Cannot add to cart. Missing parameter: productId";

    function editor(c) {
        var currentData = c.data.items;

        if (!currentData) {
            c.data.items = {
                "product": productId,
                "quantity": quantity
            }
        } else {
            if (!Array.isArray(c.data.items)) {
                if (c.data.items.product == productId) {
                    var currentQuantity = parseInt(c.data.items["quantity"]);
                    if (parseInt(quantity) == 0) {
                        c.data.items = null;
                    } else {
                        c.data.items["quantity"] = parseInt(quantity);
                    }
                } else {
                    var array = [];
                    array.push(c.data.items);
                    array.push({
                        "product": productId,
                        "quantity": quantity
                    });
                    c.data.items = array;
                }
            } else {
                var exists = false;
                c.data.items.forEach(function(item, index) {
                    if (item.product == productId) {
                        var currentQuantity = parseInt(item.quantity);
                        if(currentQuantity == 0){
                            data.items[index] = null;
                        } else {
                            item.quantity = parseInt(quantity);
                        }
                        exists = true;
                    }
                });
                if (!exists) {
                    c.data.items.push({
                        "product": productId,
                        "quantity": quantity
                    })
                }
            }
        }
        return c;
    }

    contentHelper.modifyContent({
        id: cartId,
        editor: editor
    });
}

function removeFromCart(cartId, quantity, productId) {
    if (!cartId) throw "Cannot remove from cart. Missing parameter: cartId";
    if (!quantity) throw "Cannot remove from cart. Missing parameter: quantity";
    if (!productId) throw "Cannot remove from cart. Missing parameter: productId";

    function editor(c) {
        var currentData = c.data.items;
        if (!currentData) {
            return c;
        } else {
            if (!Array.isArray(c.data.items)) {
                if (c.data.items.product == productId) {
                    var currentQuantity = parseInt(c.data.items["quantity"]);
                    var newQuantity = currentQuantity - (quantity == "all" ? currentQuantity : parseInt(quantity));
                    if (newQuantity == 0) {
                        c.data.items = null;
                    } else {
                        c.data.items["quantity"] = newQuantity;
                    }
                }
            } else {
                c.data.items.forEach(function(item, index) {
                    if (item.product == productId) {
                        var currentQuantity = parseInt(item.quantity);
                        var newQuantity = currentQuantity - (quantity == "all" ? currentQuantity : parseInt(quantity));
                        if (newQuantity == 0) {
                            c.data.items[index] = null;
                        } else {
                            item.quantity = newQuantity;
                        }
                    }
                });
            }
        }
        return c;
    }

    contentHelper.modifyContent({
        id: cartId,
        editor: editor
    });
}

function getCartFromCustomer(customer) {
    if (!customer && !customer._id) throw "Cannot get cart. Missing parameter: customer";
    var cartResult = contentLib.query({
        query: "data.customer = '" + customer._id + "'",
        contentTypes: [
            app.name+':cart'
        ]
    });

    if (cartResult.count > 1) {
        log.error("Multiple carts found for customer " + customer._id);
    }

    if (cartResult.count == 1) {
        return cartResult.hits[0];
    }

    return null;
}

function getCartFromSession(sessionId) {
    if (!sessionId) return;
    var cartResult = contentLib.query({
        query: "data.session = '" + sessionId + "' AND (data.status IN ('open_cart', 'checkout_incomplete'))",
        contentTypes: [
            app.name+':cart'
        ]
    });

    if (cartResult.count > 1) {
        log.error("Multiple carts found for session " + sessionId + ". Returning first.");
        return cartResult.hits[0]
    }

    if (cartResult.count == 1) {
        return cartResult.hits[0];
    }

    return null;
}

function createCart(context) {
    if (context.cart != null) {
        log.error("Not creating new cart, cart already exists in context");
        return;
    }
    // Customer cart is disabled untill persistent cart is properly implemented
    //if (context.customer) {
    //  return createCartForCustomer(customer)
    //} else {
    return createCartForSession(context.req.cookies.JSESSIONID)
    //}
}

function createCartForSession(sessionId) {
    if (!sessionId) throw "Cannot create cart. Missing parameter: sessionId";
    var date = new Date();
    var params = {
        name: 'cart-' + sessionId+"-"+date.getTime(),
        displayName: 'sessioncart-' + sessionId,
        path: '/shopping-carts',
        type: 'cart',
        data: {
            session: sessionId,
            status: "open_cart"
        }
    };
    var cart = contentHelper.createContent(params);
    return cart;
}

function createCartForCustomer(customer) {
    if (!customer) throw "Cannot create cart. Missing parameter: customer";
    var params = {
        name: 'cart-' + customer.displayName,
        displayName: 'usercart-' + customer.displayName,
        path: '/shopping-carts',
        type: 'cart',
        data: {
            customer: customer._id
        }
    };
    var cart = contentHelper.createContent(params);

    return cart;
}

function getCartItems(cart) {
    var items = [];
    if (cart && cart.data.items) {
        if (!Array.isArray(cart.data.items)) {
            cart.data.items = [cart.data.items];
        }
        cart.data.items.forEach(function (item) {
        	var product = contentLib.get({
                key: item.product
            });

            if(product) {
                product.url = portalLib.pageUrl({
                    id: product._id,
                    type: "absolute"
                });

                if (product.data.image) {
                    product.imageUrl = portalLib.imageUrl({
                        id: product.data.image,
                        scale: 'width(250)',
                        format: 'jpeg'
                    });
                }
                var price;
                if(product.data.discount_rate){
                    price = (product.data.unit_price - (product.data.unit_price * (product.data.discount_rate/100))) * item.quantity
                } else {
                    price = product.data.unit_price * item.quantity;
                }

                items.push({
                    product: product,
                    price: price,
                    quantity: item.quantity
                });
            }
        });
    }
    return items;
}

function archiveCart(cartId) {
    contentHelper.deleteContent(cartId);
}