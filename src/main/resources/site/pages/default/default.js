var libs = {
    portal: require('/lib/xp/portal'), // Import the portal functions
    thymeleaf: require('/lib/xp/thymeleaf') // Import the Thymeleaf rendering function
};
var klarna = require('klarnaLib');

// Specify the view file to use
var conf = {
    view: resolve('default.html')
};

// Handle the GET request
exports.get = function(req) {

    //log.info(JSON.stringify(req, null, 4))

    // Get the content that is using the page
    var content = libs.portal.getContent();
    var site = libs.portal.getSite();
    var settings = libs.portal.getSiteConfig();

    // Fragment handling (single fragments should use this page controller automatically to render itself)
    var isFragment = content.type === 'portal:fragment';
    var mainRegion = isFragment ? null : content.page.regions.main;

    // Examples of logging (built into the core of XP)
    //log.info('A string');
    //log.info('%s', content); // JSON output as string
    //log.info('Pretty JSON %s', JSON.stringify(content, null, 4));

    // Prepare the model that will be passed to the view

    var context = klarna.context(req);

    var model = {
        content: content,
        mainRegion: mainRegion,
        siteName: site.displayName,
        isFragment: isFragment,
        itemCount: context.cartItemsTotal.toFixed(0),
        klarnaIcon: libs.portal.assetUrl({path: "/img/brand.svg"}),
        siteUrl: libs.portal.pageUrl({ id: site._id }),
        checkoutPageUrl: libs.portal.pageUrl({
            id: settings.page_cart,
            type: "absolute"
        }),
        faviconUrl: libs.portal.assetUrl({path: '/img/favicon.png'}),
        componentsCss: [
            libs.portal.assetUrl({path: '/semantic/semantic.min.css'}),
            libs.portal.assetUrl({path: '/semantic/components/card.min.css'}),
            libs.portal.assetUrl({path: '/semantic/components/image.min.css'}),
            libs.portal.assetUrl({path: '/semantic/components/button.min.css'}),
            libs.portal.assetUrl({path: '/semantic/components/dimmer.min.css'}),
            libs.portal.assetUrl({path: '/semantic/components/dropdown.min.css'}),
            libs.portal.assetUrl({path: '/semantic/components/checkbox.min.css'}),
            libs.portal.assetUrl({path: '/extra/league-shared-content.css'}),
            libs.portal.assetUrl({path: '/extra/toastr.min.css'}),
            libs.portal.assetUrl({path: '/extra/number-polyfill.css'}),
            libs.portal.assetUrl({path: '/css/main.css'}),
        ],
        componentsJs: [
            "http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js",
            libs.portal.assetUrl({path: '/semantic/semantic.min.js'}),
            // libs.portal.assetUrl({path: '/semantic/components/button.min.js'}),
            libs.portal.assetUrl({path: '/semantic/components/dimmer.min.js'}),
            libs.portal.assetUrl({path: '/semantic/components/dropdown.min.js'}),
            libs.portal.assetUrl({path: '/semantic/components/checkbox.min.js'}),
            libs.portal.assetUrl({path: '/extra/league-shared-content.js'}),
            libs.portal.assetUrl({path: '/extra/toastr.min.js'}),
            libs.portal.assetUrl({path: '/extra/number-polyfill.min.js'}),
            libs.portal.assetUrl({path: '/extra/league-fantasy-bonus.js'}),
            libs.portal.assetUrl({path: '/extra/no.seeds.klarna.js'}),
        ],
    };


    model.rightMenu = [];

    if(content._id == settings.page_cart ||  content._id == settings.page_checkout || content._id == settings.page_confirmation){
        var cartPage = {
            navClass: content._id == settings.page_cart ? "cartNav active" : "cartNav",
            icon: "bagIcon",
            label: "Basket",
            cartQty: false,
            link: libs.portal.pageUrl({
                id: settings.page_cart,
                type: "absolute"
            })
        };
        model.rightMenu.push(cartPage);

        var checkoutPage = {
            navClass: content._id == settings.page_checkout ? "cartNav active" : "cartNav",
            icon: "identidyIcon",
            label: "Checkout",
            link: "#"
            // link: libs.portal.pageUrl({
            //     id: settings.page_checkout,
            //     type: "absolute"
            // })
        };
        model.rightMenu.push(checkoutPage);

        var confirmationPage = {
            navClass: content._id == settings.page_confirmation ? "cartNav active" : "cartNav",
            icon: "paymentIcon",
            label: "Confirmation",
            link: "#"
            // link: libs.portal.pageUrl({
            //     id: settings.page_confirmation,
            //     type: "absolute"
            // })
        };
        model.rightMenu.push(confirmationPage);
    } else {
        model.rightMenu.push({
            navClass: "cartNav active",
            icon: "cartIcon",
            cartQty: true,
            link: libs.portal.pageUrl({
                id: settings.page_cart,
                type: "absolute"
            })
        })
    }


    // Render the dynamic HTML with values from the model
    var body = libs.thymeleaf.render(conf.view, model);

    // Return the response object
    return {
        body: body
    }
};
