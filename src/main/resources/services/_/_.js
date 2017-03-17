var klarnaOrderClass = Java.type("no.seeds.klarna.KlarnaOrder");

exports.get = handleGet;

function handleGet(req){
    var klarnaOrder = new klarnaOrderClass();

    return {
        contentType: "application/json",
        body: {
            test1: "Hi",
            test: klarnaOrder.getOrderData()
        }
    }
}