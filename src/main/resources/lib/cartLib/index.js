var portalLib = require('/lib/xp/portal');
var klarnaNodeLib = require('klarnaNodeLib');
var contentLib = require('/lib/xp/content');

module.exports = {
    getCartFromSession: getCartFromSession,
    addToCartQuantity: addToCartQuantity,
    updateCartQuantity: updateCartQuantity,
    removeFromCart: removeFromCart,
    getCartItems: getCartItems,
    getCartItemsForOrder: getCartItemsForOrder,
    archiveCart: archiveCart,
    createCart: createCart,
    getOrders: getOrders
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
    
    klarnaNodeLib.modifyNode({
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

    klarnaNodeLib.modifyNode({
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

    klarnaNodeLib.modifyNode({
        id: cartId,
        editor: editor
    });
}

function getCartFromSession(sessionId) {
    if (!sessionId) return;
    
    var queryString = "data.session = '" + sessionId + "' AND (data.status IN ('open_cart', 'checkout_incomplete'))";
    var cartResult = klarnaNodeLib.query(queryString, app.name+':cart');

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
    
    return createCartForSession(context.req.cookies.JSESSIONID)    
}

function createCartForSession(sessionId) {
    if (!sessionId) throw "Cannot create cart. Missing parameter: sessionId";
    var date = new Date();
    var params = {
        path: '/shopping-carts',
        type: 'cart',
        data: {
            session: sessionId,
            status: "open_cart"
        }
    };
    var cart = klarnaNodeLib.createNode(params);
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
                }).replace("tool/"+app.name+"/list-orders", "portal/preview/draft");

                if (product.data.image) {
                    product.imageUrl = portalLib.imageUrl({
                        id: product.data.image,
                        scale: 'block(250,250)',
                        format: 'jpeg'
                    }).replace("tool/"+app.name+"/list-orders", "portal/preview/draft");
                }
                var price;
                if(product.data.discount_rate){
                    price = (product.data.unit_price - (product.data.unit_price * (product.data.discount_rate/100))) * item.quantity
                } else {
                    price = product.data.unit_price * item.quantity;
                }
                
                items.push({
                    product: product,
                    price: price ? price : 0,
                    quantity: item.quantity
                });
            }
        });
    }
    
    return items;
}

function getCartItemsForOrder(cart) {
	
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
                }).replace("tool/"+app.name+"/list-orders", "portal/preview/draft");

                if (product.data.image) {
                    product.imageUrl = portalLib.imageUrl({
                        id: product.data.image,
                        scale: 'block(250,250)',
                        format: 'jpeg'
                    }).replace("tool/"+app.name+"/list-orders", "portal/preview/draft");
                }
                var price;
                if(product.data.discount_rate){
                    price = (product.data.unit_price - (product.data.unit_price * (product.data.discount_rate/100))) * item.quantity
                } else {
                    price = product.data.unit_price * item.quantity;
                }
                
                items.push({
                    //product: product,
                	productId: product._id,
                    productName: product.displayName,
                    price: price,
                    quantity: item.quantity
                });
            }
        });
    }
    
    return items;
}

function archiveCart(cartId) {
	klarnaNodeLib.deleteNode(cartId);
}


function getOrders(){
	
	var carts = [];
    var shoppingCarts = klarnaNodeLib.listCarts();
    var orders = klarnaNodeLib.listOrders();

    shoppingCarts.forEach(function(el){
		carts.push(getOrderModel(el, 0));
    });
    
    orders.forEach(function(el){
        carts.push(getOrderModel(el, 1));        
    });

    return carts;
}

function getOrderModel(orderNode, cartMode){
    if(orderNode && orderNode.data){
    	
    	var product_id;
    	var orderItems;
    	
    	if (orderNode.data.items.length) {
    		orderItems = [];
    		orderNode.data.items.forEach(function(el){
    			orderItems.push(el);
    		});    		
    	}
    	
    	else{
    		orderItems = [orderNode.data.items];
    	}
    	    	
    	orderItems.forEach(function (el){
    		
    		if (cartMode) {// The cart has been converted to an order
    			product_id = el.productId;
    		}
    		
    		else {// It is still a shopping cart
    			product_id = el.product;    			
    		}
    		
    		var product = contentLib.get({
                key: product_id
            });
    		
    		if (product) {    		
    			if (!cartMode){// It is still a shopping cart
        			el.productName = product.displayName;
        			el.price = (el.quantity)*(product.data.unit_price*((100-product.data.discount_rate)/100.0));
        		}
    			
    			el.productUrl = portalLib.pageUrl({
                    id: product_id,
                    type: "absolute"
                }).replace("tool/"+app.name+"/list-orders", "portal/preview/draft");    			
    			
    			var productImage = contentLib.get({
                    key: product.data.image
                });
    			
    			if (productImage) {    				
    				el.imageUrl = portalLib.imageUrl({
                        id: product.data.image,
                        scale: 'block(250,250)',
                        format: 'jpeg'
                    }).replace("tool/"+app.name+"/list-orders", "portal/preview/draft");
    			}
    		}
    	});
        
        var nodeObj = {
            createdTime: orderNode.createdTime,
            klarnaId: orderNode.data.klarna_order_id ? orderNode.data.klarna_order_id : "-",
            status: (orderNode.data.status.toUpperCase() == "CREATED") ? "ORDER_CREATED" : orderNode.data.status.toUpperCase(),
            items: orderItems
        };
        
        return nodeObj;
    }
}