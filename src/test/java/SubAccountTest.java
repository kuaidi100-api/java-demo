import com.google.gson.Gson;
import com.kuaidi100.sdk.api.AutoNum;
import com.kuaidi100.sdk.api.ExpressReachable;
import com.kuaidi100.sdk.api.LabelV2;
import com.kuaidi100.sdk.api.QueryTrack;
import com.kuaidi100.sdk.api.QueryTrackMap;
import com.kuaidi100.sdk.api.Subscribe;
import com.kuaidi100.sdk.api.SubscribeWithMap;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.contant.PrintType;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.request.AutoNumReq;
import com.kuaidi100.sdk.request.ExpressReachableReq;
import com.kuaidi100.sdk.request.LabelCancelParam;
import com.kuaidi100.sdk.request.ManInfo;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.request.QueryTrackParam;
import com.kuaidi100.sdk.request.QueryTrackReq;
import com.kuaidi100.sdk.request.SubscribeParam;
import com.kuaidi100.sdk.request.SubscribeParameters;
import com.kuaidi100.sdk.request.SubscribeReq;
import com.kuaidi100.sdk.request.labelV2.DeliveryTimeReq;
import com.kuaidi100.sdk.request.labelV2.OrderReq;
import com.kuaidi100.sdk.request.labelV2.RepeatPrintReq;
import com.kuaidi100.sdk.utils.PropertiesReader;
import com.kuaidi100.sdk.utils.SignUtils;
import org.junit.Test;

/**
 * 子账户模式调用示例。
 * <p>
 * 使用前请将 account.properties 配置为子账户的 key / customer / secret，
 * 并传入对应的子账户专属 URL（见 {@link ApiInfoConstant} 中 SUB_* 常量）。
 *
 * @Author: api.kuaidi100.com
 * @Date: 2026-11-13 09:55
 */
public class SubAccountTest {

    /** 子账户 key */
    String key = PropertiesReader.get("key");
    /** 子账户 secret */
    String secret = PropertiesReader.get("secret");
    /** 子账户 customer */
    String customer = PropertiesReader.get("customer");

    /**
     * 实时快递查询（子账户）
     */
    @Test
    public void testQueryTrackSub() throws Exception {
        QueryTrackParam queryTrackParam = new QueryTrackParam();
        queryTrackParam.setCom(CompanyConstant.YT);
        queryTrackParam.setNum("YT5319615559666");
        queryTrackParam.setPhone("18888888888");
        String param = new Gson().toJson(queryTrackParam);

        QueryTrackReq queryTrackReq = new QueryTrackReq();
        queryTrackReq.setParam(param);
        queryTrackReq.setCustomer(customer);
        queryTrackReq.setSign(SignUtils.querySign(param, key, customer));

        IBaseClient baseClient = new QueryTrack(ApiInfoConstant.SUB_QUERY_URL);
        System.out.println(baseClient.execute(queryTrackReq));
    }

    /**
     * 订阅推送（子账户）
     */
    @Test
    public void testSubscribeSub() throws Exception {
        SubscribeParameters subscribeParameters = new SubscribeParameters();
        subscribeParameters.setCallbackurl("http://www.your-domain.com/callback");
        subscribeParameters.setPhone("18888888888");

        SubscribeParam subscribeParam = new SubscribeParam();
        subscribeParam.setParameters(subscribeParameters);
        subscribeParam.setCompany(CompanyConstant.YT);
        subscribeParam.setNumber("YT5319615559666");
        subscribeParam.setKey(key);

        SubscribeReq subscribeReq = new SubscribeReq();
        subscribeReq.setSchema(ApiInfoConstant.SUBSCRIBE_SCHEMA);
        subscribeReq.setParam(new Gson().toJson(subscribeParam));

        IBaseClient subscribe = new Subscribe(ApiInfoConstant.SUB_SUBSCRIBE_URL);
        System.out.println(subscribe.execute(subscribeReq));
    }

    /**
     * 地图轨迹查询（子账户）
     */
    @Test
    public void testQueryMapViewSub() throws Exception {
        QueryTrackParam queryTrackParam = new QueryTrackParam();
        queryTrackParam.setCom(CompanyConstant.YT);
        queryTrackParam.setNum("YT5319615559666");
        queryTrackParam.setPhone("18888888888");
        queryTrackParam.setFrom("广东省深圳市福田区");
        queryTrackParam.setTo("广东省深圳市南山区");
        queryTrackParam.setResultv2("2");
        String param = new Gson().toJson(queryTrackParam);

        QueryTrackReq queryTrackReq = new QueryTrackReq();
        queryTrackReq.setParam(param);
        queryTrackReq.setCustomer(customer);
        queryTrackReq.setSign(SignUtils.querySign(param, key, customer));

        IBaseClient baseClient = new QueryTrackMap(ApiInfoConstant.SUB_QUERY_MAP_URL);
        System.out.println(baseClient.execute(queryTrackReq));
    }

    /**
     * 地图轨迹订阅（子账户）
     */
    @Test
    public void testSubscribeWithMapSub() throws Exception {
        SubscribeParameters subscribeParameters = new SubscribeParameters();
        subscribeParameters.setCallbackurl("http://www.your-domain.com/callback");
        subscribeParameters.setResultv2("2");
        subscribeParameters.setPhone("18888888888");

        SubscribeParam subscribeParam = new SubscribeParam();
        subscribeParam.setParameters(subscribeParameters);
        subscribeParam.setCompany(CompanyConstant.YT);
        subscribeParam.setNumber("YT5319615559666");
        subscribeParam.setFrom("广东省深圳市福田区");
        subscribeParam.setTo("广东省深圳市南山区");
        subscribeParam.setKey(key);

        SubscribeReq subscribeReq = new SubscribeReq();
        subscribeReq.setSchema(ApiInfoConstant.SUBSCRIBE_SCHEMA);
        subscribeReq.setParam(new Gson().toJson(subscribeParam));

        IBaseClient subscribe = new SubscribeWithMap(ApiInfoConstant.SUB_SUBSCRIBE_MAP_URL);
        System.out.println(subscribe.execute(subscribeReq));
    }

    /**
     * 电子面单下单（子账户）
     */
    @Test
    public void testLabelOrderSub() throws Exception {
        ManInfo recManInfo = new ManInfo();
        recManInfo.setName("张三");
        recManInfo.setMobile("15999566666");
        recManInfo.setPrintAddr("广东省深圳市南山区科技南十二路");

        ManInfo sendManInfo = new ManInfo();
        sendManInfo.setName("李四");
        sendManInfo.setMobile("15999566666");
        sendManInfo.setPrintAddr("北京市海淀区xxx路");

        OrderReq orderReq = new OrderReq();
        orderReq.setKuaidicom(CompanyConstant.ZJS);
        orderReq.setCount(1);
        orderReq.setSiid(PropertiesReader.get("siid"));
        orderReq.setTempId("60f6c17c7c223700131d8bc3");
        orderReq.setSendMan(sendManInfo);
        orderReq.setRecMan(recManInfo);
        orderReq.setPrintType(PrintType.CLOUD);

        String param = new Gson().toJson(orderReq);
        String t = String.valueOf(System.currentTimeMillis());

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param, t, key, secret));
        printReq.setMethod(ApiInfoConstant.ORDER);
        printReq.setParam(param);

        LabelV2 labelV2 = new LabelV2(ApiInfoConstant.SUB_ELECTRONIC_ORDER_URL);
        System.out.println(labelV2.order(printReq));
    }

    /**
     * 电子面单取消（子账户）
     */
    @Test
    public void testLabelCancelSub() throws Exception {
        LabelCancelParam labelCancelParam = new LabelCancelParam();
        labelCancelParam.setPartnerId("test_partner_id");
        labelCancelParam.setKuaidicom(CompanyConstant.SF);
        labelCancelParam.setKuaidinum("SF1342567604302");
        labelCancelParam.setReason("暂时不寄了");

        String param = new Gson().toJson(labelCancelParam);
        String t = String.valueOf(System.currentTimeMillis());

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param, t, key, secret));
        printReq.setMethod(ApiInfoConstant.CANCEL_METHOD);
        printReq.setParam(param);

        LabelV2 labelV2 = new LabelV2(ApiInfoConstant.SUB_ELECTRONIC_CANCEL_URL);
        System.out.println(labelV2.execute(printReq));
    }

    /**
     * 电子面单复打（子账户）
     */
    @Test
    public void testLabelReprintSub() throws Exception {
        RepeatPrintReq repeatPrintReq = new RepeatPrintReq();
        repeatPrintReq.setTaskId("027B34AD22DE4F299643A13642B70D5F");

        String param = new Gson().toJson(repeatPrintReq);
        String t = String.valueOf(System.currentTimeMillis());

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param, t, key, secret));
        printReq.setMethod(ApiInfoConstant.CLOUD_PRINT_OLD_METHOD);
        printReq.setParam(param);

        LabelV2 labelV2 = new LabelV2(ApiInfoConstant.SUB_ELECTRONIC_REPRINT_URL);
        System.out.println(labelV2.repeatPrint(printReq));
    }

    /**
     * 时效预估（子账户）
     */
    @Test
    public void testDeliveryTimeSub() throws Exception {
        DeliveryTimeReq deliveryTimeReq = new DeliveryTimeReq();
        deliveryTimeReq.setKuaidicom("jd");
        deliveryTimeReq.setFrom("广东省深圳市南山区");
        deliveryTimeReq.setTo("广东省深圳市宝安区");
        deliveryTimeReq.setOrderTime("2025-12-10 10:00:00");
        deliveryTimeReq.setExpType("京东标快");

        String param = new Gson().toJson(deliveryTimeReq);
        String t = String.valueOf(System.currentTimeMillis());

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param, t, key, secret));
        printReq.setMethod(ApiInfoConstant.TIME);
        printReq.setParam(param);

        LabelV2 labelV2 = new LabelV2(ApiInfoConstant.SUB_TIME_URL);
        System.out.println(labelV2.deliveryTime(printReq));
    }

    /**
     * 智能单号识别（子账户）
     */
    @Test
    public void testAutoNumSub() throws Exception {
        AutoNumReq autoNumReq = new AutoNumReq();
        autoNumReq.setKey(key);
        autoNumReq.setNum("YT5319615559666");

        IBaseClient baseClient = new AutoNum(ApiInfoConstant.SUB_AUTO_NUM_URL);
        System.out.println(baseClient.execute(autoNumReq));
    }

    /**
     * 快递可用性（子账户）
     */
    @Test
    public void testExpressReachableSub() throws Exception {
        ExpressReachableReq expressReachableReq = new ExpressReachableReq();
        expressReachableReq.setKuaidicom("ems");
        expressReachableReq.setRecManName("张三");
        expressReachableReq.setRecManMobile("12345678910");
        expressReachableReq.setRecManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");
        expressReachableReq.setSendManName("李四");
        expressReachableReq.setSendManMobile("12345678910");
        expressReachableReq.setSendManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");

        String t = String.valueOf(System.currentTimeMillis());
        String param = new Gson().toJson(expressReachableReq);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.REACHABLE_METHOD);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param, t, key, secret));
        printReq.setParam(param);

        IBaseClient baseClient = new ExpressReachable(ApiInfoConstant.SUB_REACHABLE_URL);
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 电子面单多场景：同一 LabelV2 实例按 method 路由到不同子账户 URL
     */
    @Test
    public void testLabelV2MultiUrlSub() throws Exception {
        LabelV2 labelV2 = new LabelV2(
                ApiInfoConstant.SUB_ELECTRONIC_ORDER_URL,
                ApiInfoConstant.SUB_ELECTRONIC_CANCEL_URL,
                ApiInfoConstant.SUB_TIME_URL,
                ApiInfoConstant.SUB_ELECTRONIC_REPRINT_URL);

        DeliveryTimeReq deliveryTimeReq = new DeliveryTimeReq();
        deliveryTimeReq.setKuaidicom("jd");
        deliveryTimeReq.setFrom("广东省深圳市南山区");
        deliveryTimeReq.setTo("广东省深圳市宝安区");
        deliveryTimeReq.setOrderTime("2025-12-10 10:00:00");
        deliveryTimeReq.setExpType("京东标快");

        String param = new Gson().toJson(deliveryTimeReq);
        String t = String.valueOf(System.currentTimeMillis());

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param, t, key, secret));
        printReq.setMethod(ApiInfoConstant.TIME);
        printReq.setParam(param);

        System.out.println(labelV2.deliveryTime(printReq));
    }
}
