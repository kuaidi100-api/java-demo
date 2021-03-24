import com.google.gson.Gson;
import com.kuaidi100.sdk.api.SameCityOrder;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.request.samecity.AuthReq;
import com.kuaidi100.sdk.request.samecity.CancelReq;
import com.kuaidi100.sdk.request.samecity.OrderReq;
import com.kuaidi100.sdk.request.samecity.QueryReq;
import com.kuaidi100.sdk.utils.SignUtils;
import org.junit.Test;

/**
 * 同城配送测试用例
 *
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 16:53
 */
public class SameCityTest extends BaseServiceTest{

    /**
     * 获取授权
     */
    @Test
    public void testAuth() throws Exception {
        PrintReq printReq = new PrintReq();
        AuthReq authReq = new AuthReq();

        authReq.setCom(CompanyConstant.SS);
        //替换成贵司在闪送的店铺id
        authReq.setStoreId("123456");
        authReq.setCallbackUrl("http://www.baidu.com");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(authReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.SAME_CITY_AUTH_METHOD);

        IBaseClient sameCityOrder = new SameCityOrder();
        System.out.println(sameCityOrder.execute(printReq));
    }

    /**
     * 下单
     */
    @Test
    public void testOrder() throws Exception {
        PrintReq printReq = new PrintReq();
        OrderReq orderReq = new OrderReq();

        orderReq.setCom(CompanyConstant.KFW);
        //替换成贵司在闪送的店铺id
        orderReq.setStoreId("123456");
        orderReq.setSendManName("张三");
        orderReq.setSendManMobile("15966666666");
        orderReq.setSendManPrintAddr("广东深圳市南山区金蝶软件园");
        orderReq.setRecManName("李四");
        orderReq.setRecManMobile("18888888888");
        orderReq.setRecManPrintAddr("广东深圳市福田区华强南");
        orderReq.setPrice(100);
        orderReq.setOrderSourceType("饿了么");
        orderReq.setOrderSourceType("ele11111111");
        orderReq.setWeight(1.5);
        orderReq.setPartnerId("1999328601");
        orderReq.setPartnerKey("806cdf87a2977e99e360a1b8de9dfb000326375d");
        orderReq.setRemark("测试订单待会取消");
        orderReq.setServiceType("火锅");
        orderReq.setCallbackUrl("http://www.baidu.com");
        orderReq.setOrderType(0);

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(orderReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.SAME_CITY_ORDER_METHOD);

        IBaseClient sameCityOrder = new SameCityOrder();
        System.out.println(sameCityOrder.execute(printReq));
    }

    /**
     * 查询订单
     */
    @Test
    public void testQuery() throws Exception {
        PrintReq printReq = new PrintReq();

        QueryReq queryReq = new QueryReq();
        queryReq.setTaskId("5EB5351750A742CB9D1C6EB46C98963E");
        queryReq.setOrderId("1000013");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(queryReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.SAME_CITY_QUERY_METHOD);

        IBaseClient sameCityOrder = new SameCityOrder();
        System.out.println(sameCityOrder.execute(printReq));
    }

    /**
     * 取消下单
     */
    @Test
    public void testCancel() throws Exception {
        PrintReq printReq = new PrintReq();
        CancelReq cancelReq = new CancelReq();
        cancelReq.setTaskId("5EB5351750A742CB9D1C6EB46C98963E");
        cancelReq.setOrderId("1000013");
        cancelReq.setCancelMsg("测试单取消");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(cancelReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.SAME_CITY_CANCEL_METHOD);

        IBaseClient sameCityOrder = new SameCityOrder();
        System.out.println(sameCityOrder.execute(printReq));
    }
}
