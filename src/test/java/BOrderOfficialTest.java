import com.google.gson.Gson;
import com.kuaidi100.sdk.api.BOrderOfficial;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.request.*;
import com.kuaidi100.sdk.utils.SignUtils;
import org.junit.Test;

/**
 * 商家寄件(官方寄件)测试用例
 *
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 15:00
 */
public class BOrderOfficialTest extends BaseServiceTest{

    /**
     * 商家寄件下单接口
     */
    @Test
    public void testBorderOfficial() throws Exception {
        PrintReq printReq = new PrintReq();
        BOrderReq bOrderReq = new BOrderReq();
        bOrderReq.setKuaidicom(CompanyConstant.JD);
        bOrderReq.setSendManName("张三");
        bOrderReq.setSendManMobile("15966666666");
        bOrderReq.setSendManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");
        bOrderReq.setRecManName("李四");
        bOrderReq.setRecManMobile("18888888888");
        bOrderReq.setRecManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");
        bOrderReq.setCallBackUrl("http://www.baidu.com");
        bOrderReq.setWeight("1");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(bOrderReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.B_ORDER_OFFICIAL_ORDER_METHOD);
        System.out.println(printReq);
        IBaseClient bOrder = new BOrderOfficial();
        System.out.println(bOrder.execute(printReq));
    }

    /**
     * 商家寄件下单取消接口
     */
    @Test
    public void testBorderOfficialCancel() throws Exception {
        PrintReq printReq = new PrintReq();
        BOrderCancelReq bOrderCancelReq = new BOrderCancelReq();
        bOrderCancelReq.setTaskId("2DB69EAE2F48F8AEF00C4BB6F57BF79E");
        bOrderCancelReq.setOrderId("17390954");
        bOrderCancelReq.setCancelMsg("测试单取消");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(bOrderCancelReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.B_ORDER_OFFICIAL_CANCEL_METHOD);

        IBaseClient bOrder = new BOrderOfficial();
        System.out.println(bOrder.execute(printReq));
    }
    /**
     * 商家寄件下单价格接口
     */
    @Test
    public void testBorderOfficialQueryPrice() throws Exception {
        PrintReq printReq = new PrintReq();
        BOrderOfficialQueryPriceReq officialQueryPriceReq = new BOrderOfficialQueryPriceReq();

        officialQueryPriceReq.setKuaidiCom("jtexpress");
        officialQueryPriceReq.setSendManPrintAddr("广东省深圳市");
        officialQueryPriceReq.setRecManPrintAddr("福建省厦门市");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(officialQueryPriceReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.B_ORDER_OFFICIAL_PRICE_METHOD);

        IBaseClient bOrder = new BOrderOfficial();
        System.out.println(bOrder.execute(printReq));
    }
    /**
     * 商家寄件订单详情查询接口
     */
    @Test
    public void testBorderOfficialQueryDetail() throws Exception {
        PrintReq printReq = new PrintReq();
        BOrderOfficialQueryDetailReq officialQueryPriceReq = new BOrderOfficialQueryDetailReq();

        officialQueryPriceReq.setTaskId("8CE30D*******4E2F5F");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(officialQueryPriceReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.DETAIL);

        IBaseClient bOrder = new BOrderOfficial();
        System.out.println(bOrder.execute(printReq));
    }
}
