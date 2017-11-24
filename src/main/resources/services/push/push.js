var libs = {
    portal: require('/lib/xp/portal'), // Import the portal functions
    klarna: require('klarnaLib')
};

// Specify the view file to use
var conf = {
    view: resolve('default.html'),
};

exports.post = function(req) {
    var checkout = libs.klarna.getKlarnaCheckout(req);
};
