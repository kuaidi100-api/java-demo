import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.api.*;
import com.kuaidi100.sdk.cloud.CloudBase;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.contant.CloudApiCodeConstant;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.contant.PrintType;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.*;
import com.kuaidi100.sdk.request.bsamecity.BsamecityAddfeeReq;
import com.kuaidi100.sdk.request.bsamecity.BsamecityCancelReq;
import com.kuaidi100.sdk.request.bsamecity.BsamecityOrderReq;
import com.kuaidi100.sdk.request.bsamecity.Goods;
import com.kuaidi100.sdk.request.cloud.COrderCancelReq;
import com.kuaidi100.sdk.request.cloud.COrderQueryReq;
import com.kuaidi100.sdk.request.cloud.COrderReq;
import com.kuaidi100.sdk.request.labelV2.CustomReq;
import com.kuaidi100.sdk.request.labelV2.DeliveryTimeReq;
import com.kuaidi100.sdk.request.labelV2.OrderReq;
import com.kuaidi100.sdk.request.labelV2.RepeatPrintReq;
import com.kuaidi100.sdk.response.QueryTrackMapResp;
import com.kuaidi100.sdk.response.labelV2.DeliveryTimeResp;
import com.kuaidi100.sdk.response.labelV2.Result;
import com.kuaidi100.sdk.utils.PropertiesReader;
import com.kuaidi100.sdk.utils.SignUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.junit.Test;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-15 16:20
 */
public class BaseServiceTest {

    String key = PropertiesReader.get("key");
    String customer = PropertiesReader.get("customer");
    String secret = PropertiesReader.get("secret");
    String siid = PropertiesReader.get("siid");
    String userid = PropertiesReader.get("userid");
    String tid = PropertiesReader.get("tid");
    String secret_key = PropertiesReader.get("secret_key");
    String secret_secret = PropertiesReader.get("secret_secret");
    /**
     * 实时快递查询接口
     */
    @Test
    public void testQueryTrack() throws Exception{

        QueryTrackReq queryTrackReq = new QueryTrackReq();
        QueryTrackParam queryTrackParam = new QueryTrackParam();
        queryTrackParam.setCom(CompanyConstant.YT);
        queryTrackParam.setNum("YT9383342193097");
        queryTrackParam.setPhone("17725390266");
        String param = new Gson().toJson(queryTrackParam);

        queryTrackReq.setParam(param);
        queryTrackReq.setCustomer(customer);
        queryTrackReq.setSign(SignUtils.querySign(param ,key,customer));

        IBaseClient baseClient = new QueryTrack();
        System.out.println(baseClient.execute(queryTrackReq));
    }

    /**
     * 快递查询地图轨迹
     */
    @Test
    public void testQueryMapView() throws Exception{

        QueryTrackReq queryTrackReq = new QueryTrackReq();
        QueryTrackParam queryTrackParam = new QueryTrackParam();
        queryTrackParam.setCom(CompanyConstant.YD);
        queryTrackParam.setNum("4311159956248");
        queryTrackParam.setPhone("17725390266");
        queryTrackParam.setFrom("河北保定市");
        queryTrackParam.setTo("湖南岳阳市");
        queryTrackParam.setResultv2("2");
        String param = new Gson().toJson(queryTrackParam);

        queryTrackReq.setParam(param);
        queryTrackReq.setCustomer(customer);
        queryTrackReq.setSign(SignUtils.querySign(param ,key,customer));

        IBaseClient baseClient = new QueryTrackMap();
        HttpResult result = baseClient.execute(queryTrackReq);

        QueryTrackMapResp queryTrackMapResp = new Gson().fromJson(result.getBody(),QueryTrackMapResp.class);
        System.out.println(queryTrackMapResp);
    }

    /**
     * 订阅接口
     */
    @Test
    public void testSubscribe() throws Exception{
        SubscribeParameters subscribeParameters = new SubscribeParameters();
        subscribeParameters.setCallbackurl("http://www.baidu.com");
        subscribeParameters.setPhone("17725390266");

        SubscribeParam subscribeParam = new SubscribeParam();
        subscribeParam.setParameters(subscribeParameters);
        subscribeParam.setCompany(CompanyConstant.ST);
        subscribeParam.setNumber("773039762404825");
        subscribeParam.setKey(key);

        SubscribeReq subscribeReq = new SubscribeReq();
        subscribeReq.setSchema(ApiInfoConstant.SUBSCRIBE_SCHEMA);
        subscribeReq.setParam(new Gson().toJson(subscribeParam));

        IBaseClient subscribe = new Subscribe();
        System.out.println(subscribe.execute(subscribeReq));
    }

    /**
     * 智能识别接口（正式用户可以使用）
     */
    @Test
    public void testAutoNum() throws Exception{
        AutoNumReq autoNumReq = new AutoNumReq();
        autoNumReq.setKey(key);
        autoNumReq.setNum("773039762404825");

        IBaseClient baseClient = new AutoNum();
        System.out.println(baseClient.execute(autoNumReq));
    }

    /**
     * 电子面单下单接口(V2)
     *
     * @throws Exception
     */
    @Test
    public void  testLabelOrder() throws Exception {

        ManInfo recManInfo  = new ManInfo();
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
        orderReq.setSiid(siid);
        orderReq.setTempId("60f6c17c7c223700131d8bc3");
        orderReq.setSendMan(sendManInfo);
        orderReq.setRecMan(recManInfo);

        orderReq.setPrintType(PrintType.CLOUD);

        String param = new Gson().toJson(orderReq);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.ORDER);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));

    }


    /**
     * 运单附件查询接口
     *
     * @throws Exception
     */
    @Test
    public void  testBackOrder() throws Exception {
        BackOrderReq backOrderReq = new BackOrderReq();
        backOrderReq.setPartnerId("12345678910");
        backOrderReq.setPartnerKey("12345678910");
        backOrderReq.setKuaidicom(CompanyConstant.SF);
        backOrderReq.setKuaidinum("SF1234567");
        backOrderReq.setPhone("13088888888");
        String param = new Gson().toJson(backOrderReq);
        String t = System.currentTimeMillis() + "";
        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.BACKORDER);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));

    }


    /**
     * 云打印复打(V2)
     *
     * @throws Exception
     */
    @Test
    public void  testPrintOld() throws Exception {
        RepeatPrintReq repeatPrintReq = new RepeatPrintReq();

        repeatPrintReq.setTaskId("027B34AD22DE4F299643A13642B70D5F");

        String param = new Gson().toJson(repeatPrintReq);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.CLOUD_PRINT_OLD_METHOD);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 自定义打印(V2)
     *
     * @throws Exception
     */
    @Test
    public void  testCustom() throws Exception {
        CustomReq customReq = new CustomReq();

        customReq.setPrintType(PrintType.IMAGE);
        customReq.setTempId("41b9d19ee56b45b5a23d7b6ace4f9029");

        Map<String,Object> customParam = new HashMap<String,Object>();
        customParam.put("qrcode","888888888");
        customReq.setCustomParam(customParam);

        String param = new Gson().toJson(customReq);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.CUSTOM);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 电子面单取消
     * @throws Exception
     */
    public void testLabelCancel() throws Exception{
        LabelCancelParam labelCancelParam = new LabelCancelParam();
        labelCancelParam.setPartnerId("test");
        labelCancelParam.setKuaidicom(CompanyConstant.SF);
        labelCancelParam.setKuaidinum("SF1342567604302");
        //快递公司订单号(对应下单时返回的kdComOrderNum，如果没有可以不传，否则必传)
        labelCancelParam.setOrderId("01639366271685GNkZEX");

        labelCancelParam.setReason("暂时不寄了");
        String param = new Gson().toJson(labelCancelParam);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.CANCEL_METHOD);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient baseClient = new LabelCancel();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 快递预估时效
     *
     * @throws Exception
     */
    @Test
    public void  testDeliveryTime() throws Exception {
        DeliveryTimeReq deliveryTimeReq = new DeliveryTimeReq();
        deliveryTimeReq.setKuaidicom("jd");
        deliveryTimeReq.setFrom("广东省广州市白云区");
        deliveryTimeReq.setTo("广东省深圳市南山区");
        deliveryTimeReq.setOrderTime("2023-10-11 10:00:00");
        deliveryTimeReq.setExpType("特惠送");


        String param = new Gson().toJson(deliveryTimeReq);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.TIME);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        HttpResult httpResult = baseClient.execute(printReq);
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 电子面单图片接口(v1版本示例，后续不维护新功能，建议使用v2)
     */
    @Test
    public void testPrintImg() throws Exception{
        PrintImgParam printImgParam = new PrintImgParam();
        printImgParam.setKuaidicom(CompanyConstant.ZJS);
        printImgParam.setSendManName("张三");
        printImgParam.setSendManMobile("15999566666");
        printImgParam.setSendManPrintAddr("广东省深圳市南山区科技南十二路");
        printImgParam.setRecManName("李四");
        printImgParam.setRecManMobile("15999566666");
        printImgParam.setRecManPrintAddr("北京市海淀区xxx路");
        printImgParam.setType("10");
        printImgParam.setTempid("180c7c8f646742ca871a92c976392b05");
        printImgParam.setCount("1");

        String param = new Gson().toJson(printImgParam);
        String t = System.currentTimeMillis() + "";
        String sign = SignUtils.printSign(param,t,key,secret);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.ELECTRONIC_ORDER_PIC_METHOD);
        printReq.setSign(sign);
        printReq.setParam(param);
        printReq.setT(t);

        IBaseClient printImg = new PrintImg();
        System.out.println(printImg.execute(printReq));
    }

    /**
     * 电子面单HTML接口(v1版本示例，后续不维护新功能，建议使用v2)
     */
    @Test
    public void testPrintHtml() throws Exception{
        ManInfo recManInfo  = new ManInfo();
        recManInfo.setName("张三");
        recManInfo.setMobile("15999566666");
        recManInfo.setPrintAddr("广东省深圳市南山区科技南十二路");

        ManInfo sendManInfo = new ManInfo();
        sendManInfo.setName("李四");
        sendManInfo.setMobile("15999566666");
        sendManInfo.setPrintAddr("北京市海淀区xxx路");

        PrintHtmlParam printHtmlParam = new PrintHtmlParam();
        printHtmlParam.setKuaidicom(CompanyConstant.ZJS);
        printHtmlParam.setCount("2");
        printHtmlParam.setNeedChild("1");
        //如果需要返回电子面单，需要设置
        printHtmlParam.setNeedTemplate("1");
        printHtmlParam.setSendMan(sendManInfo);
        printHtmlParam.setRecMan(recManInfo);

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(printHtmlParam);
        String sign = SignUtils.printSign(param,t,key,secret);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.ELECTRONIC_ORDER_HTML_METHOD);
        printReq.setT(t);
        printReq.setSign(sign);
        printReq.setParam(param);

        IBaseClient printHtml = new PrintHtml();
        System.out.println(printHtml.execute(printReq));
    }

    /**
     * 电子面单打印接口(v1版本示例，后续不维护新功能，建议使用v2)
     */
    @Test
    public void testPrintCloud() throws Exception{
        ManInfo recManInfo  = new ManInfo();
        recManInfo.setName("张三");
        recManInfo.setMobile("15999566666");
        recManInfo.setPrintAddr("广东省深圳市南山区科技南十二路");

        ManInfo sendManInfo = new ManInfo();
        sendManInfo.setName("李四");
        sendManInfo.setMobile("15999566666");
        sendManInfo.setPrintAddr("北京市海淀区xxx路");

        PrintCloudParam printCloudParam = new PrintCloudParam();
        printCloudParam.setKuaidicom(CompanyConstant.ZJS);
        printCloudParam.setCount("1");
        printCloudParam.setSiid(siid);
        printCloudParam.setTempid("180c7c8f646742ca871a92c976392b05");
        printCloudParam.setSendMan(sendManInfo);
        printCloudParam.setRecMan(recManInfo);

        String param = new Gson().toJson(printCloudParam);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.ELECTRONIC_ORDER_PRINT_METHOD);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient baseClient = new PrintCloud();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 云打印自定义(v1版本示例，后续不维护新功能，建议使用v2)
     */
    @Test
    public void testCloudCustom() throws Exception{
        CloudPrintCustomParam cloudPrintCustomParam = new CloudPrintCustomParam();
        cloudPrintCustomParam.setSiid(siid);
        cloudPrintCustomParam.setCallBackUrl("http://www.baidu.com");
        cloudPrintCustomParam.setTempid("180c7c8f646742ca871a92c976392b05");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(cloudPrintCustomParam);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.CLOUD_PRINT_CUSTOM_METHOD);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient baseClient = new CloudPrintCustom();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 附件打印接口
     */
    @Test
    public void testCloudAttachment() throws Exception{
        CloudPrintAttachmentParam cloudPrintAttachmentParam = new CloudPrintAttachmentParam();
        cloudPrintAttachmentParam.setSiid(siid);
        cloudPrintAttachmentParam.setCallBackUrl("http://www.baidu.com");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(cloudPrintAttachmentParam);
        CloudAttachmentReq cloudPrintAttachmentReq = new CloudAttachmentReq();

        cloudPrintAttachmentReq.setKey(key);
        cloudPrintAttachmentReq.setMethod(ApiInfoConstant.CLOUD_PRINT_ATTACHMENT_METHOD);
        cloudPrintAttachmentReq.setT(t);
        cloudPrintAttachmentReq.setSign(SignUtils.printSign(param,t,key,secret));
        cloudPrintAttachmentReq.setParam(param);
        cloudPrintAttachmentReq.setFile(new File("C:\\Users\\Administrator.-20171106WFEKLN\\Desktop\\1.jpg"));

        IBaseClient baseClient = new CloudPrintAttachment();
        System.out.println(baseClient.execute(cloudPrintAttachmentReq));
    }

    /**
     * 复打(v1版本示例，建议使用v2)
     */
    @Test
    public void testCloudPrintOld() throws Exception{
        PrintReq printReq = new PrintReq();
        CloudPrintOldParam cloudPrintOldParam = new CloudPrintOldParam();
        cloudPrintOldParam.setTaskId("A32AA6754669C14CBE26EB79664D2266");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(cloudPrintOldParam);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.CLOUD_PRINT_OLD_METHOD);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient cloudPrintOld = new CloudPrintOld();
        System.out.println(cloudPrintOld.execute(printReq));
    }

    /**
     * 第三方平台账号授权
     */
    @Test
    public void testThirdAuth() throws Exception{
        PrintReq printReq = new PrintReq();
        ThirdAuthReq thirdAuthReq = new ThirdAuthReq();
        thirdAuthReq.setNet("taobao");
        thirdAuthReq.setCallBackUrl("http://www.baidu.com");
        thirdAuthReq.setView("web");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(thirdAuthReq);

        printReq.setKey(key);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient thirdAuth = new ThirdAuth();
        System.out.println(thirdAuth.execute(printReq));
    }

    /**
     * 快递100短信发送接口
     */
    @Test
    public void testSendSms() throws Exception{
        SendSmsReq sendSmsReq = new SendSmsReq();
        sendSmsReq.setCallback("http://www.baidu.com");
        Map<String,String> content = new HashMap<String, String>();
        content.put("username","测试用户");
        sendSmsReq.setContent(new Gson().toJson(content));
        sendSmsReq.setPhone("15994708912");
        sendSmsReq.setSeller("贵司名称");
        sendSmsReq.setUserid(userid);
        sendSmsReq.setTid(tid);
        sendSmsReq.setSign(SignUtils.smsSign(key,userid));

        IBaseClient sendSms = new SendSms();
        System.out.println(sendSms.execute(sendSmsReq));
    }

    /**
     * C端查询运力(云平台接口)
     */
    @Test
    public void testCOrderQuery() throws Exception {
        COrderQueryReq cOrderQueryReq = new COrderQueryReq();
        cOrderQueryReq.setAddress("广东省深圳市南山区华强南");
        cOrderQueryReq.setSecret_key(secret_key);
        cOrderQueryReq.setSecret_code(CloudApiCodeConstant.ORDER_QUERY_EXPRESS);
        cOrderQueryReq.setSecret_sign(SignUtils.cloudSign(secret_key, secret_secret));

        IBaseClient cloudBase = new CloudBase();
        System.out.println(cloudBase.execute(cOrderQueryReq));
    }

    /**
     * c端寄件(云平台接口)
     */
    @Test
    public void testCOrder() throws Exception {
        COrderReq cOrderReq = new COrderReq();
        cOrderReq.setCom(CompanyConstant.SF);
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
        cOrderReq.setSecret_key(secret_key);
        cOrderReq.setSecret_code(CloudApiCodeConstant.ORDER);
        cOrderReq.setSecret_sign(SignUtils.cloudSign(secret_key,secret_secret));

        IBaseClient cloudBase = new CloudBase();
        System.out.println(cloudBase.execute(cOrderReq));
    }

    /**
     * c端取消寄件(云平台接口)
     */
    @Test
    public void testCOrderCancel() throws Exception {
        COrderCancelReq cOrderCancelReq = new COrderCancelReq();
        cOrderCancelReq.setTaskId("B9D3FF44B7439F298BA62211E3AC7126");
        cOrderCancelReq.setOrderId("17561388");
        cOrderCancelReq.setCancelMsg("测试单");
        cOrderCancelReq.setSecret_key(secret_key);
        cOrderCancelReq.setSecret_code(CloudApiCodeConstant.ORDER_CANCEL);
        cOrderCancelReq.setSecret_sign(SignUtils.cloudSign(secret_key,secret_secret));

        IBaseClient cloudBase = new CloudBase();
        System.out.println(cloudBase.execute(cOrderCancelReq));
    }

    /**
     * 发货单接口
     *
     * @throws Exception
     */
    @Test
    public void  testCloudPrintParcelsBill() throws Exception {

        CloudPrintParcelsBillReq cloudPrintParcelsBillReq = new CloudPrintParcelsBillReq();

        cloudPrintParcelsBillReq.setCallBackUrl("http://www.baidu.com");
        cloudPrintParcelsBillReq.setTempid("164509714515858026");
        cloudPrintParcelsBillReq.setSiid(siid);


        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(cloudPrintParcelsBillReq);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BILL_PARCELS_METHOD);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);

        IBaseClient parcelsBill = new CloudPrintParcelsBill();
        System.out.println(parcelsBill.execute(printReq));
    }

    /**
     * 快递面单OCR识别接口
     *
     * @throws Exception
     */
    @Test
    public void  testElecDetocr() throws Exception {

        OrcParam orcParam = new OrcParam();
        orcParam.setImageUrl("https://cdn.kuaidi100.com/images/openapi/document/ocr_tem.png");
        String param = new Gson().toJson(orcParam);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setParam(param);

        IBaseClient orc = new ElecDetocr();
        System.out.println(orc.execute(printReq));

    }


    /**
     * 快递可用性查询
     *
     * @throws Exception
     */
    @Test
    public void  testExpressReachable() throws Exception {

        PrintReq printReq = new PrintReq();
        ExpressReachableReq expressReachableReq = new ExpressReachableReq();
        expressReachableReq.setKuaidicom("ems");
        expressReachableReq.setRecManName("张三");
        expressReachableReq.setRecManMobile("12345678910");
        expressReachableReq.setRecManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");
        expressReachableReq.setSendManName("李四");
        expressReachableReq.setSendManMobile("12345678910");
        expressReachableReq.setSendManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");


        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(expressReachableReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.REACHABLE_METHOD);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient cloudPrintOld = new ExpressReachable();
        System.out.println(cloudPrintOld.execute(printReq));

    }

    /**
     * 同城寄件-预下单
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityPrice() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityOrderReq bsamecityOrderReq = new BsamecityOrderReq();
        bsamecityOrderReq.setKuaidicom("shunfengtongcheng");
        bsamecityOrderReq.setLbsType(2);
        bsamecityOrderReq.setRecManName("张三");
        bsamecityOrderReq.setRecManMobile("12345678910");
        bsamecityOrderReq.setRecManProvince("北京市");
        bsamecityOrderReq.setRecManCity("北京市");
        bsamecityOrderReq.setRecManDistrict("海淀区");
        bsamecityOrderReq.setRecManAddr("学清嘉创大厦A座15层");
        bsamecityOrderReq.setRecManLat("40.014838");
        bsamecityOrderReq.setRecManLng("116.352569");
        bsamecityOrderReq.setSendManName("李四");
        bsamecityOrderReq.setSendManMobile("12345678910");
        bsamecityOrderReq.setSendManProvince("北京市");
        bsamecityOrderReq.setSendManCity("北京市");
        bsamecityOrderReq.setSendManDistrict("海淀区");
        bsamecityOrderReq.setSendManAddr("清华大学");
        bsamecityOrderReq.setSendManLat("40.002436");
        bsamecityOrderReq.setSendManLng("116.326582");
        bsamecityOrderReq.setWeight("1");
        bsamecityOrderReq.setRemark("测试下单");
        bsamecityOrderReq.setVolume("");
        bsamecityOrderReq.setOrderType(0);
        bsamecityOrderReq.setExpectPickupTime("");
        bsamecityOrderReq.setExpectFinishTime("");
        bsamecityOrderReq.setInsurance("");
        bsamecityOrderReq.setPrice("0");
        Goods goods = new Goods("外卖", "食品", 1);
        ArrayList<Goods> goods_list = new ArrayList<Goods>();
        goods_list.add(goods);
        bsamecityOrderReq.setGoods(goods_list);

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityOrderReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BSAMECITY_PRICE);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }

    /**
     * 同城寄件-下单
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityOrder() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityOrderReq bsamecityOrderReq = new BsamecityOrderReq();
        bsamecityOrderReq.setKuaidicom("shunfengtongcheng");
        bsamecityOrderReq.setLbsType(2);
        bsamecityOrderReq.setRecManName("张三");
        bsamecityOrderReq.setRecManMobile("12345678910");
        bsamecityOrderReq.setRecManProvince("北京市");
        bsamecityOrderReq.setRecManCity("北京市");
        bsamecityOrderReq.setRecManDistrict("海淀区");
        bsamecityOrderReq.setRecManAddr("学清嘉创大厦A座15层");
        bsamecityOrderReq.setRecManLat("40.014838");
        bsamecityOrderReq.setRecManLng("116.352569");
        bsamecityOrderReq.setSendManName("李四");
        bsamecityOrderReq.setSendManMobile("12345678910");
        bsamecityOrderReq.setSendManProvince("北京市");
        bsamecityOrderReq.setSendManCity("北京市");
        bsamecityOrderReq.setSendManDistrict("海淀区");
        bsamecityOrderReq.setSendManAddr("清华大学");
        bsamecityOrderReq.setSendManLat("40.002436");
        bsamecityOrderReq.setSendManLng("116.326582");
        bsamecityOrderReq.setWeight("1");
        bsamecityOrderReq.setRemark("测试下单");
        bsamecityOrderReq.setVolume("");
        bsamecityOrderReq.setOrderType(0);
        bsamecityOrderReq.setExpectPickupTime("");
        bsamecityOrderReq.setExpectFinishTime("");
        bsamecityOrderReq.setInsurance("");
        bsamecityOrderReq.setPrice("0");
        Goods goods = new Goods("外卖", "食品", 1);
        ArrayList<Goods> goods_list = new ArrayList<Goods>();
        goods_list.add(goods);
        bsamecityOrderReq.setGoods(goods_list);
        bsamecityOrderReq.setCallbackUrl("http://baidu.com");
        bsamecityOrderReq.setSalt("");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityOrderReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BSAMECITY_ORDER);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }

    /**
     * 同城寄件-预取消
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityPrecancel() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityCancelReq bsamecityCancelReq = new BsamecityCancelReq();
        bsamecityCancelReq.setOrderId("100094");
        bsamecityCancelReq.setCancelMsgType(1);
        bsamecityCancelReq.setCancelMsg("测试寄件");
        bsamecityCancelReq.setTaskId("3B8E825DCCEE4F28B4A93685DA62F7F2");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityCancelReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BSAMECITY_PRECANCEL);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }

    /**
     * 同城寄件-取消
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityCancel() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityCancelReq bsamecityCancelReq = new BsamecityCancelReq();
        bsamecityCancelReq.setOrderId("100239");
        bsamecityCancelReq.setCancelMsgType(1);
        bsamecityCancelReq.setCancelMsg("测试寄件");
        bsamecityCancelReq.setTaskId("BEA8285B6A014A1A94707CE3CF484D0A");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityCancelReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BSAMECITY_CANCEL);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }

    /**
     * 同城寄件-加小费
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityAddfee() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityAddfeeReq bsamecityAddfeeReq = new BsamecityAddfeeReq();
        bsamecityAddfeeReq.setOrderId("100240");
        bsamecityAddfeeReq.setRemark("加钱");
        bsamecityAddfeeReq.setTaskId("1F495CE0E58B40A296694116CFBCE347");
        bsamecityAddfeeReq.setTips("10");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityAddfeeReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BSAMECITY_ADDFEE);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }
}
