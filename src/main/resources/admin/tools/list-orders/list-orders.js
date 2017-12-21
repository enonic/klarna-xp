var thymeleaf = require('/lib/xp/thymeleaf');
var portalLib = require('/lib/xp/portal');
var contentLib = require("/lib/xp/content");
var contextLib = require("/lib/xp/context");
var cartLib = require("cartLib");
var timestamp = Date.now();

exports.get = handleGet;

function getUrl(params, type){
    var paramsTmp = []
    if(params.pageArticles) {
        if (type == "previous") {
            paramsTmp.push("pageArticles=" + (parseInt(params.pageArticles) - 1));
        } else if (type == "next") {
            paramsTmp.push("pageArticles=" + (parseInt(params.pageArticles) + 1))
        } else if (type == "base"){
            paramsTmp.push("pageArticles=" + (parseInt(params.pageArticles)))
        }
    } else {
        if(type == "previous"){
            paramsTmp.push("pageArticles=1");
        } else if (type == "next"){
            paramsTmp.push("pageArticles=2");
        }
    }

    if(params.text){
        paramsTmp.push("text="+params.text);
    }

    if(params._id && type != "base"){
        paramsTmp.push("_id="+params._id);
    }
    return "?"+paramsTmp.join("&");
};

function handleGet(req){
    var params = {
        adminUrl: portalLib.url({path: "/admin"}),
        assetsUri: portalLib.url({path: "/admin/assets/" + timestamp}),
        appId: 'list-orders',
        appName: 'Klarna Checkout',
        componentsCss: [
            portalLib.assetUrl({path: '/semantic/semantic.min.css'}),
            portalLib.assetUrl({path: '/semantic/components/dropdown.min.css'}),
            portalLib.assetUrl({path: '/semantic/components/checkbox.min.css'}),
            portalLib.assetUrl({path: '/extra/league-shared-content.css'}),
            portalLib.assetUrl({path: '/extra/toastr.min.css'}),
            portalLib.assetUrl({path: '/css/main.css'})
        ],
        componentsJs: [
            "https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
            portalLib.assetUrl({path: '/semantic/semantic.min.js'}),
            portalLib.assetUrl({path: '/semantic/components/dropdown.min.js'}),
            portalLib.assetUrl({path: '/semantic/components/checkbox.min.js'}),
            portalLib.assetUrl({path: '/extra/toastr.min.js'}),
        ],
        faviconUrl: portalLib.assetUrl({path: "/img/application.svg"}),
        baseUrl: getUrl(req.params, "base"),
        orders: cartLib.getOrders()
    };
    
    params.menu = [];



    var view = resolve('list-orders.html');
    params.viewMode = "Matches";

    return {
        body: thymeleaf.render(view, params)
    }
}