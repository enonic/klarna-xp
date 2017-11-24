var klarna = require('klarnaLib');
var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');

var currencyMap = {
    "EUR": "€",
    "NOK": "kr",
    "DKK": "kr",
    "SEK": "kr"
};

exports.get = function (req) {

    var model = contentLib.get({
        key: req.params._id
    });

    model.imageUrl = portal.imageUrl({
        id: model.data.image,
        scale: 'width(250)',
        format: 'jpeg'
    });

    return {
        body: thymeleaf.render(resolve('product.html'), model)
    }
};