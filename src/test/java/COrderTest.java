import com.google.gson.Gson;
import com.kuaidi100.sdk.api.COrder;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.request.cloud.COrderCancelReq;
import com.kuaidi100.sdk.request.corder.COrderQueryPriceReq;
import com.kuaidi100.sdk.request.corder.COrderReq;
import com.kuaidi100.sdk.utils.SignUtils;
import org.junit.Test;

/**
 * @Author: ligl
 * @Date: 2022-09-05 15:14
 */
public class COrderTest extends BaseServiceTest{

    /**
     * C端寄件下单接口
     */
    @Test
    public void testCOrder() throws Exception {
        PrintReq printReq = new PrintReq();
        COrderReq cOrderReq = new COrderReq();
        cOrderReq.setKuaidicom(CompanyConstant.SF);
        cOrderReq.setSendManName("张三");
        cOrderReq.setSendManMobile("15966666666");
        cOrderReq.setSendManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");
        cOrderReq.setRecManName("李四");
        cOrderReq.setRecManMobile("15966666666");
        cOrderReq.setRecManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");
        cOrderReq.setCallBackUrl("http://www.baidu.com");
        cOrderReq.setCargo("文件");
        cOrderReq.setRemark("测试下单，待会取消");
        cOrderReq.setWeight("1");
        cOrderReq.setSalt("123456");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(cOrderReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.C_ORDER_METHOD);

        IBaseClient cOrder = new COrder();
        System.out.println(cOrder.execute(printReq));
    }

    /**
     * C端寄件下单取消接口
     */
    @Test
    public void testCOrderCancel() throws Exception {
        PrintReq printReq = new PrintReq();
        COrderCancelReq cOrderCancelReq = new COrderCancelReq();
        cOrderCancelReq.setTaskId("FD80D2CD311E8F7A3D3AC28E515974AF");
        cOrderCancelReq.setOrderId("26732931");
        cOrderCancelReq.setCancelMsg("测试单取消");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(cOrderCancelReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.CANCEL_METHOD);

        IBaseClient bOrder = new COrder();
        System.out.println(bOrder.execute(printReq));
    }

    /**
     * C端寄件价格查询接口
     */
    @Test
    public void testCOrderQueryPrice() throws Exception {
        PrintReq printReq = new PrintReq();
        COrderQueryPriceReq queryPriceReq = new COrderQueryPriceReq();
        queryPriceReq.setKuaidicom(CompanyConstant.JD);
        queryPriceReq.setSendManPrintAddr("广东省深圳市南山区金蝶软件园");
        queryPriceReq.setRecManPrintAddr("广东省深圳市罗湖区火车站");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(queryPriceReq);

        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);
        printReq.setMethod(ApiInfoConstant.C_ORDER_PRICE_METHOD);

        IBaseClient bOrder = new COrder();
        System.out.println(bOrder.execute(printReq));
    }
}
