package no.seeds.klarna;

import com.klarna.rest.api.Client;
import com.klarna.rest.api.DefaultClient;
import com.klarna.rest.api.Order;
import com.klarna.rest.api.model.Address;
import com.klarna.rest.api.model.OrderData;
import com.klarna.rest.api.model.OrderLine;
import com.klarna.rest.api.model.Refund;
import com.klarna.rest.api.model.request.UpdateAuthorization;
import com.klarna.rest.api.model.request.UpdateCustomerDetails;
import com.klarna.rest.api.model.request.UpdateMerchantReferences;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;


public class KlarnaOrder{
    public OrderData getOrderData(){
        String merchantId = "0";
        String sharedSecret = "sharedSecret";
        URI baseUrl = Client.EU_TEST_BASE_URL;
        String orderId = "12345";

        Client client = DefaultClient.newInstance(merchantId, sharedSecret, baseUrl);

        Order order = client.newOrder(orderId);

        OrderData data = order.fetch();

        return data;
    }
}