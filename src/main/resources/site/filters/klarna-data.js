var libs = {
    portal: require('/lib/xp/portal'),
    util: require('/lib/enonic/util'),
    thymeleaf: require('/lib/xp/thymeleaf'),
    i18n: require('/lib/xp/i18n'),
    md5: require("md5")
};

var view = resolve('klarna-data.html');

exports.responseFilter = function(req, res) {

    var params = {
        cartReloadUrl: libs.portal.serviceUrl({
            service: 'checkout'
        }),
        msg: {
            shopping_cart: libs.i18n.localize({ key: 'shopping_cart' })
        }
    }

    var metadata = libs.thymeleaf.render(view, params);

    var cookieString = libs.md5(new Date().valueOf());
    if(req.cookies){
        if(!req.cookies.JSESSIONID){
            if(res.cookies) {
                res.cookies.JSESSIONID = cookieString;
            } else {
                res.cookies = {
                    "JSESSIONID": cookieString
                }
            }
        }
    } else {
        res.cookies = {
            "JSESSIONID": cookieString
        }
    }

    res.pageContributions.bodyEnd = libs.util.data.forceArray(res.pageContributions.headEnd);
    res.pageContributions.bodyEnd.push(metadata);
    //log.info(JSON.stringify(req,null,4));
    //log.info(JSON.stringify(res,null,4));
    return res;
}