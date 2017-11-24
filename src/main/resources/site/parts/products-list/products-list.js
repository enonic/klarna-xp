var libs = {
    portal: require('/lib/xp/portal'), // Import the portal functions
    thymeleaf: require('/lib/xp/thymeleaf'),
    content: require('/lib/xp/content'),
    contentHelper: require('contentHelper'),
    i18n: require('/lib/xp/i18n')
};

// Specify the view file to use
var conf = {
    view: resolve('products-list.html'),
    currencyMap: {
        "EUR": "€",
        "NOK": "kr",
        "DKK": "kr",
        "SEK": "kr"
    }
};

// Handle the GET request
exports.get = function(req) {

    var site = libs.portal.getSite();

    var content = libs.portal.getContent();
    var config = libs.portal.getComponent().config;

    var model = {
        products: getProducts(config),
        categories: getCategories(),
        msg: {
            buy: libs.i18n.localize({ key: 'add_to_cart' }),
            view_product: libs.i18n.localize({ key: 'view_product' }),
        },
        pageName: config.title ? config.title : content.displayName
    };

    // Return the merged view and model in the response object
    return {
        body: libs.thymeleaf.render(conf.view, model)
    }
};


function getPrice(price){
    var siteConfig = libs.portal.getSiteConfig();

    var price = (price);

    price = conf.currencyMap[siteConfig.purchase_currency] + " " + price.toFixed(2);

    return price;
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

function getCategories(){
    var site = libs.portal.getSite();
    var content = libs.portal.getContent();
    var categories = libs.content.query({
        query: "_path LIKE '/content"+site._path+"/*'",
        contentTypes: [
            app.name + ':category'
        ]
    }).hits;

    var categoriesList = [];

    categories.forEach(function (categoryData){
        var category = {
            _id: categoryData._id,
            name: categoryData.data.name ? categoryData.data.name : categoryData.displayName,
            class: content._id == categoryData._id ? "active" : "",
            url: libs.portal.pageUrl({
                id: categoryData._id
            })
        }
        categoriesList.push(category)
    });

    return categoriesList;
}

function getProducts(config) {
    var products;
    var content = libs.portal.getContent();
    if (!config || !config.item) {
        products = libs.content.query({
            query: "_path LIKE '/content"+content._path+"/*'",
            contentTypes: [
                app.name + ':product'
            ]
        }).hits;
    } else {
        products = libs.contentHelper.list(config.item);
    }

    var productList = [];
    if (products) {
        products.forEach(function (productData) {
            var product = {
                _id: productData._id,
                name: productData.displayName,
                price: getPrice(productData.data.unit_price),
                priceClass: "",
                discount: getDiscount(productData.data.discount_rate),
                discountedPrice: getDiscountedPrice(productData.data.unit_price, productData.data.discount_rate)
            }

            if(product.discountedPrice){
                product.priceClass = "discounted";
            }

            product.imageUrl = libs.portal.imageUrl({
                id: productData.data.image,
                scale: 'width(250)',
                format: 'jpeg'
            });
            product.productViewUrl = libs.portal.pageUrl({
                id: productData._id
            });
            product.addToCart = libs.portal.serviceUrl({
                service: "cart",
                params: {
                    action: "addQty",
                    productId: productData._id,
                    quantity: 1
                }
            });

            productList.push(product);
        });
    }

    return productList;
}