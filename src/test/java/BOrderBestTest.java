import com.google.gson.Gson;
import com.kuaidi100.sdk.api.BOrder;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.request.*;
import com.kuaidi100.sdk.utils.SignUtils;
import org.junit.Test;

/**
 * 商家寄件（优选快递）测试用例 接口以下架
 *　
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 15:49
 */
@Deprecated
public class BOrderBestTest extends BaseServiceTest{

    /**
     * 商家寄件查询运力
     */
    @Test
    public void testBorderQuery() throws Exception {
        BOrderQueryReq bOrderQueryReq = new BOrderQueryReq();
        bOrderQueryReq.setSendAddr("福田区华强南");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(bOrderQueryReq);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.B_ORDER_QUERY_TRANSPORT_CAPACITY_METHOD);

        IBaseClient bOrder = new BOrder();
        System.out.println(bOrder.execute(printReq));
    }

    /**
     * 商家寄件
     */
    @Test
    public void testBorder() throws Exception {
        PrintReq printReq = new PrintReq();
        BOrderReq bOrderReq = new BOrderReq();
        bOrderReq.setKuaidicom(CompanyConstant.ZT);
        bOrderReq.setSendManName("张三");
        bOrderReq.setSendManMobile("15966666666");
        bOrderReq.setSendManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");
        bOrderReq.setRecManName("李四");
        bOrderReq.setRecManMobile("15966666666");
        bOrderReq.setRecManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");
        bOrderReq.setCallBackUrl("http://www.baidu.com");
        bOrderReq.setCargo("文件");
        bOrderReq.setRemark("测试下单，待会取消");
        bOrderReq.setWeight("1");
        bOrderReq.setSalt("123456");
        bOrderReq.setServiceType("标准快递");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(bOrderReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.B_ORDER_SEND_METHOD);

        IBaseClient bOrder = new BOrder();
        System.out.println(bOrder.execute(printReq));
    }

    /**
     * 商家寄件获取验证码
     */
    @Test
    public void testBorderGetCode() throws Exception {
        PrintReq printReq = new PrintReq();
        BOrderGetCodeReq bOrderGetCodeReq = new BOrderGetCodeReq();
        bOrderGetCodeReq.setTaskId("4D07550D8E685E06B3C679632E68ACDD");
        bOrderGetCodeReq.setOrderId("100012022010566");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(bOrderGetCodeReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.B_ORDER_CODE_METHOD);

        IBaseClient bOrder = new BOrder();
        System.out.println(bOrder.execute(printReq));
    }

    /**
     * 商家寄件取消
     */
    @Test
    public void testBorderCancel() throws Exception {
        PrintReq printReq = new PrintReq();
        BOrderCancelReq bOrderCancelReq = new BOrderCancelReq();
        bOrderCancelReq.setTaskId("4D07550D8E685E06B3C679632E68ACDD");
        bOrderCancelReq.setOrderId("100012022010566");
        bOrderCancelReq.setCancelMsg("测试单取消");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(bOrderCancelReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.B_ORDER_CANCEL_METHOD);

        IBaseClient bOrder = new BOrder();
        System.out.println(bOrder.execute(printReq));
    }
}
