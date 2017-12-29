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

    var price = (price);
    
    if (price)
	{
    	price = currencyMap[siteConfig.purchase_currency] + " " + price.toFixed(2);
    	price = price.replace(".", ",");
        return price;
	}
		
}


function getDiscount(discount){
    if(discount){
        if(discount > 0){
            return discount.toFixed(0) + "% OFF";
        }
    }
}

function getDiscountedPrice(price, discount){
    if(discount){
        if(discount > 0){
            return getPrice((price - (price * (discount/100))))
        }
    }
}

exports.get = function (req) {

    var model = portal.getContent();    
    var site = portal.getSite();
    model.price = getPrice(model.data.unit_price);

    model.contentUrl = portal.pageUrl({
        id: model._id,
        type: "absolute"
    }).replace("/admin/portal/admin/draft/"+site._name, "");

    model.addToCart = portal.serviceUrl({
        service: "cart",
        params: {
            action: "addQty",
            productId: model._id,
            quantity: 1
        }
    });

    model.imageUrl = portal.imageUrl({
        id: model.data.image,
        scale: 'width(250)',
        format: 'jpeg'
    });

    model.intro = model.data.intro;
    model.description =  portal.processHtml({value: model.data.body});
    model.discount = getDiscount(model.data.discount_rate);
    model.discountedPrice = getDiscountedPrice(model.data.unit_price, model.data.discount_rate);

    model.priceClass = "";
    if(model.discountedPrice){
        model.priceClass = "discounted";
    }
        
    return {
        body: thymeleaf.render(resolve('product.html'), model)
    }
};