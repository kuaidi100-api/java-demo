<h1 align="center"><a href="https://github.com/kuaidi100-api/kuadi100-api/" target="_blank">java-demo Project</a></h1>

## Introduce

java-demo 是由[快递100](https://api.kuaidi100.com/home)官方提供的java sdk，方便调试使用。

java-demo 集成了实时查询、订阅推送、智能判断、云打印相关、电子面单相关、短信、商家寄件等接口。

## Features

- 提供了快递100接口请求参数实体类、返回实体类。
- 提供测试类调试。
- 支持maven、gradle引入

## Getting started

java-demo使用和测试可参考[java-demo-test](https://github.com/kuaidi100-api/kuadi100-api/blob/master/src/test/java/BaseServiceTest.java)。

```
# git clone https://github.com/kuaidi100-api/java-demo.git
```

#### Add Config

使用sdk的可以先配置[account.properties](https://github.com/kuaidi100-api/kuadi100-api/blob/master/src/main/resources/account.properties)，账号信息可以登录快递100获取https://poll.kuaidi100.com/manager/page/myinfo/enterprise （注意不要泄露快递100的账号密码以及授权key等敏感信息，以防被他人盗用！！！）

#### Gradle

```css
dependencies {
	implementation 'com.github.kuaidi100-api:sdk:1.0.4'
}
```

#### Maven

```css
	<dependency>
            <groupId>com.github.kuaidi100-api</groupId>
            <artifactId>sdk</artifactId>
            <version>1.0.4</version>
        </dependency>
```

### Use Junit Test

```java
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

```

## FAQ

### 问题1.快递100api接口里sign该如何处理？

快递100加密方式统一为MD5后转大写，可以参考[签名](https://github.com/kuaidi100-api/kuadi100-api/blob/master/src/main/java/com/kuaidi100/sdk/utils/SignUtils.java)

```java
org.apache.commons.codec.digest.DigestUtils.md5Hex(msg).toUpperCase();
```

### 问题2.使用了快递100订阅接口后，该如何处理回调接口？

可以参考推送[订阅回调](https://github.com/kuaidi100-api/kuadi100-api/blob/master/src/main/java/com/kuaidi100/sdk/api/Subscribe.java#L56)

```java
public SubscribeResp callBackUrl(HttpServletRequest request){
        String param = request.getParameter("param");
        String sign = request.getParameter("sign");
        //建议记录一下这个回调的内容，方便出问题后双方排查问题
        log.debug("快递100订阅推送回调结果|{}|{}",param,sign);
        //订阅时传的salt,没有可以忽略
        String salt = "";
        String ourSign = SignUtils.sign(param + salt);
        SubscribeResp subscribeResp = new SubscribeResp();
        subscribeResp.setResult(Boolean.TRUE);
        subscribeResp.setReturnCode("200");
        subscribeResp.setMessage("成功");
        //加密如果相等，属于快递100推送；否则可以忽略掉当前请求
        if (ourSign.equals(sign)){
            //TODO 业务处理
            return subscribeResp;
        }
        return null;
    }
```

### 问题3.使用电子面单图片接口，该如何处理返回的base64图片？

返回的是一个字符串json数组，多个子单时会有多个。

添加前缀“`data:image/png;base64,`”，把“`\\\\n`”替换成“”；可以参考[处理返回的base64字符串](https://github.com/kuaidi100-api/kuadi100-api/blob/master/src/main/java/com/kuaidi100/sdk/api/PrintImg.java#L47)

```java
public List<String> getBase64Img(String imgBase64){
        List<String> stringList= new Gson().fromJson(imgBase64,
                                 new TypeToken<List<String>>() {}.getType());
        List<String> base64Img = new ArrayList<String>();
        if (stringList != null && stringList.size()>0){
            for (String s : stringList) {
                s = "data:image/png;base64,"+s.replace("\\\\n","");
                base64Img.add(s);
            }
        }
        return base64Img;
    }
```

### 问题4.云平台其他接口该如何对接？

第一步：根据对应接口新增对应的请求参数类，继承[CloudBaseReq](https://github.com/kuaidi100-api/java-demo/blob/3221138a7b0d5b48b114e0b44ca2c1832075644a/src/main/java/com/kuaidi100/sdk/request/cloud/CloudBaseReq.java ),类似快递寄件接口取消寄件请求参数类

```java
public class COrderCancelReq extends CloudBaseReq{
    /**
     * 任务ID
     */
    private String taskId;
    /**
     * 订单ID
     */
    private String orderId;
    /**
     * 取消原因，例：暂时不寄件了
     */
    private String cancelMsg;
}
```

第二步：调用时只需要更换成第一步新建的实体

```java
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
```

tips：key、secret、code等账号信息获取，[云平台](http://cloud.kuaidi100.com/ )->[买家中心-我的接口](https://cloud.kuaidi100.com/buyer/api)

![image-20201207190323327](https://cdn.kuaidi100.com/images/openapiabout/help.png)
