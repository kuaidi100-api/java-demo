import com.google.gson.Gson;
import com.kuaidi100.sdk.api.*;
import com.kuaidi100.sdk.cloud.CloudBase;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.contant.CloudApiCodeConstant;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.*;
import com.kuaidi100.sdk.request.cloud.COrderCancelReq;
import com.kuaidi100.sdk.request.cloud.COrderQueryReq;
import com.kuaidi100.sdk.request.cloud.COrderReq;
import com.kuaidi100.sdk.response.QueryTrackMapResp;
import com.kuaidi100.sdk.utils.PropertiesReader;
import com.kuaidi100.sdk.utils.SignUtils;
import org.junit.Test;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-15 16:20
 */
public class BaseServiceTest {

    private String key = PropertiesReader.get("key");
    private String customer = PropertiesReader.get("customer");
    private String secret = PropertiesReader.get("secret");
    private String siid = PropertiesReader.get("siid");
    private String userid = PropertiesReader.get("userid");
    private String tid = PropertiesReader.get("tid");
    private String secret_key = PropertiesReader.get("secret_key");
    private String secret_secret = PropertiesReader.get("secret_secret");
    /**
     * 查询物流轨迹
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
     * 快递信息地图轨迹
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
     * 订阅
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
     * 电子面单图片接口
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
     * 电子面单html接口
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
        printHtmlParam.setCount(2);
        printHtmlParam.setNeedChild(1);
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
     * 电子面单打印
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
     * 云打印自定义
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
     * 云打印附件
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
     * 复打
     */
    @Test
    public void testCloudPrintOld() throws Exception{
        PrintReq printReq = new PrintReq();
        CloudPrintOldParam cloudPrintOldParam = new CloudPrintOldParam();
        cloudPrintOldParam.setTaskId("D21DB1AC74A260E6F5604FC43B4598B8");

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
     * 第三方授权
     */
    @Test
    public void testThirdAuth() throws Exception{
        PrintReq printReq = new PrintReq();
        ThirdAuthReq thirdAuthReq = new ThirdAuthReq();
        thirdAuthReq.setNet("cainiao");
        thirdAuthReq.setCallBackUrl("http://www.baidu.com");

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
     * 发送短信
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
        bOrderReq.setSendManPrintAddr("广东深圳市福田区华强南");
        bOrderReq.setRecManName("李四");
        bOrderReq.setRecManMobile("15966666666");
        bOrderReq.setRecManPrintAddr("广东深圳市南山区金蝶软件园");
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

    /**
     * C端查询运力
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
     * c端寄件
     */
    @Test
    public void testCOrder() throws Exception {
        COrderReq cOrderReq = new COrderReq();
        cOrderReq.setCom(CompanyConstant.JD);
        cOrderReq.setSendManName("张三");
        cOrderReq.setSendManMobile("15966666666");
        cOrderReq.setSendManPrintAddr("广东深圳市南山区金蝶软件园");
        cOrderReq.setRecManName("李四");
        cOrderReq.setRecManMobile("15966666666");
        cOrderReq.setRecManPrintAddr("广东深圳市福田区华强南");
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
     * c端取消寄件
     */
    @Test
    public void testCOrderCancel() throws Exception {
        COrderCancelReq cOrderCancelReq = new COrderCancelReq();
        cOrderCancelReq.setTaskId("B19BB4C6F33BE9E735A63D4142557751");
        cOrderCancelReq.setOrderId("11115207");
        cOrderCancelReq.setCancelMsg("测试单");
        cOrderCancelReq.setSecret_key(secret_key);
        cOrderCancelReq.setSecret_code(CloudApiCodeConstant.ORDER_CANCEL);
        cOrderCancelReq.setSecret_sign(SignUtils.cloudSign(secret_key,secret_secret));

        IBaseClient cloudBase = new CloudBase();
        System.out.println(cloudBase.execute(cOrderCancelReq));
    }
}
