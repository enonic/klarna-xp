
var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');

function forceArray(data) {
    if (!Array.isArray(data) && (data != null || data != undefined)) {
        data = [data];
    } else if (data == null || data == undefined){
        data = [];
    }
    return data;
};

exports.get =  function (req){
    /*var status = response.status;
     var message = response.message;
     var body = response.body;  // */
    var site = portal.getSite();
    var query = "ngram('*', '"+req.params.part+"', 'OR')";

    var query = "_path LIKE '/content"+site._path+"/*' AND ngram('page.template,page.controller', '*', 'OR')";
    var result = contentLib.query({
        query: query,
        count: 200,
        sort: "_path ASC"
    })

    var paginas = [];
    var componentsUsage = {
        pages: {},
        layout: {},
        part: {},
        usingTemplate: {}
    };
    result.hits.forEach(function(content){
        if(content.page.controller){
            if(!componentsUsage.pages[content.page.controller]){
                componentsUsage.pages[content.page.controller] = [content._path];
            } else {
                componentsUsage.pages[content.page.controller].push(content._path);
            }

            for(var regionName in content.page.regions){
                var components = forceArray(content.page.regions[regionName].components);
                components.forEach(function (component) {
                    if (!componentsUsage[component.type][component.descriptor]) {
                        componentsUsage[component.type][component.descriptor] = [content._path];
                    } else {
                        componentsUsage[component.type][component.descriptor].push(content._path);
                    }
                });
            }
        } else if(content.page.template){
            if(!componentsUsage.usingTemplate[content.page.controller]){
                componentsUsage.usingTemplate[content.page.controller] = [content._path];
            } else {
                componentsUsage.usingTemplate[content.page.controller].push(content._path);
            }
        }
    });

    var view = resolve("template_usage.html");

    if(!req.params.debug) {
        return {
            body: thymeleaf.render(view, {
                components: componentsUsage
            })
        };
    } else {
        return {
           contentType: "application/json",
           body: {
               components: componentsUsage
           }
        };
    }
}
