var authLib = require('/lib/xp/auth');
var klarnaNodeLib = require('klarnaNodeLib');

module.exports = {
    getCustomer: getCustomer,
    updateAddress: updateAddress
};

function getCustomer() {
    var user = authLib.getUser();
    if (user && user.key) {
        var customer = fetchCustomer(user.key);
        if (!customer) {
            return createCustomer(user.key);
        }
        return customer;
    }
    return null;
}

function updateAddress(customer, params) {
    if (customer && customer.data) {
        if (customer.data.name == params.name &&
            customer.data.address == params.address &&
            customer.data.zip == params.zip &&
            customer.data.city == params.city) {
            return customer;
        }
    }

    function editor(c) {
        c.data.name = params.name;
        c.data.address = params.address;
        c.data.zip = params.zip;
        c.data.city = params.city;

        return c;
    }
    log.info("about to update address");
    return klarnaNodeLib.modifyContent({
        id: customer._id,
        editor: editor
    });
}

function fetchCustomer(userKey) {
	
	var queryString = "data.userKey = '" + userKey + "'";
	var customerResult = klarnaNodeLib.query(queryString, 'no.iskald.payup:customer');
    
    if (customerResult.count == 0) return;

    if (customerResult.count > 1) {
        customerResult.hits.forEach(function (customer) {
            klarnaNodeLib.delete(customer._id);
        });
    }
    return customerResult.hits[0];
}

function createCustomer(userKey) {
    var params = {
        name: 'customer-' + userKey,
        displayName: 'customer-' + userKey,
        path: '/customers',
        type: 'customer',
        data: {
            userKey: userKey
        }
    };

    return klarnaNodeLib.createContent(params);
}