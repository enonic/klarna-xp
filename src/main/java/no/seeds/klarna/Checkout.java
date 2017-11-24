package no.seeds.klarna;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import com.klarna.checkout.Order;
import com.klarna.checkout.Connector;
import com.klarna.checkout.IConnector;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import com.enonic.xp.script.ScriptValue;

import org.codehaus.jackson.map.ObjectMapper;

public class Checkout {
    private Map<String, Object> merchant;

    private String secretKey;
    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    private String purchaseCountry;

    public void setPurchaseCountry(String purchaseCountry) {
        this.purchaseCountry = purchaseCountry;
    }

    private String purchaseCurrency;

    public void setPurchaseCurrency(String purchaseCurrency) {
        this.purchaseCurrency = purchaseCurrency;
    }

    private String locale;

	public void setLocale(String locale) {
        this.locale = locale;
    }

    private final ArrayList<Map<String, Object>> productsList = new ArrayList<Map<String, Object>>();

    private final Map<String, Object> cart = new HashMap<String, Object>(){
        {
            put("items", productsList);
        }
    };



    public void setMerchant(ScriptValue merchant) {
        this.merchant = merchant.getMap();
    }

    public void addProduct(ScriptValue product){
        Map<String, Object> productMap = product.getMap();
        System.out.println(productMap.get("unit_price").getClass());

        this.productsList.add(productMap);
    }

    public String getOrderData() throws IOException, NoSuchAlgorithmException{
        ObjectMapper mapper = new ObjectMapper();

        final Map<String, Object> cart = new HashMap<String, Object>() {
            {
                put("items", productsList);
            }
        };

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("cart", cart);

        data.put("purchase_country", this.purchaseCountry);
        data.put("purchase_currency", this.purchaseCurrency);
        data.put("locale", this.locale);
        data.put("merchant", merchant);

        try {
            IConnector connector = Connector.create(this.secretKey, IConnector.TEST_BASE_URL);
            Order order = new Order(connector);
            order.create(data);

            order.fetch();

            Map<String, Object> gui = (Map<String, Object>) order.get("gui");
            String snippet = (String) gui.get("snippet");

            Map<String, Object> orderData = new HashMap<String, Object>() {
                {
                    put("id", order.get("id"));
                    put("status", order.get("status"));
                    put("snippet", snippet);
                }
            };
            return mapper.writeValueAsString(orderData);
        } catch (Exception exception){
            return mapper.writeValueAsString(exception);
        }
    }

    public String getOrderData(String order_id) throws IOException, NoSuchAlgorithmException{
        ObjectMapper mapper = new ObjectMapper();

        try {
            IConnector connector = Connector.create(this.secretKey, IConnector.TEST_BASE_URL);
            Order order = new Order(connector, order_id);
            order.fetch();

			System.out.println(mapper.writeValueAsString(order.get("status")));

            Map<String, Object> gui = (Map<String, Object>) order.get("gui");
            String snippet = (String) gui.get("snippet");

			if(order.get("status").equals("checkout_complete")){
				Map<String, Object> newStatus = new HashMap<String, Object>() {
                    {
                        put("status", "created");
                    }
                };
				order.update(newStatus);
			}

			Map<String, Object> orderData = new HashMap<String, Object>() {
                {
                    put("id", order.get("id"));
                    put("status", order.get("status"));
                    put("snippet", snippet);
                }
            };

            // Output the snippet on your page.
            return mapper.writeValueAsString(orderData);
        } catch (Exception exception){
            return mapper.writeValueAsString(exception);
        }
    }
}