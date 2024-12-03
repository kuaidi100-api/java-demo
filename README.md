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
	implementation 'com.github.kuaidi100-api:sdk:1.0.15'
}
```

#### Maven

```css
	<dependency>
            <groupId>com.github.kuaidi100-api</groupId>
            <artifactId>sdk</artifactId>
            <version>1.0.15</version>
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
          * 地图轨迹订阅
          */
         @Test
         public void testSubscribe() throws Exception{
             SubscribeParameters subscribeParameters = new SubscribeParameters();
             subscribeParameters.setCallbackurl("http://www.baidu.com");
             subscribeParameters.setPhone("17725390266");
     
             SubscribeParam subscribeParam = new SubscribeParam();
             subscribeParam.setParameters(subscribeParameters);
             subscribeParam.setCompany(CompanyConstant.YT);
             subscribeParam.setNumber("YT5319615559666");
             subscribeParam.setFrom("湖北省孝感市大悟县公司");
             subscribeParam.setTo("浙江省宁波市");
             subscribeParam.setKey(key);
     
             SubscribeReq subscribeReq = new SubscribeReq();
             subscribeReq.setSchema(ApiInfoConstant.SUBSCRIBE_SCHEMA);
             subscribeReq.setParam(new Gson().toJson(subscribeParam));
     
             IBaseClient subscribe = new SubscribeWithMap();
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
     * 订单拦截接口
     *
     * @throws Exception
     */
    @Test
    public void  testInterceptOrder() throws Exception {
        InterceptOrderReq interceptOrderReq = new InterceptOrderReq();
        interceptOrderReq.setOrderId("123456789");
        interceptOrderReq.setKuaidicom(CompanyConstant.JT);
        interceptOrderReq.setKuaidinum("JT12345678");
        interceptOrderReq.setPartnerId("12345678");
        interceptOrderReq.setPartnerKey("12345678");
        interceptOrderReq.setReason("测试拦截");
        interceptOrderReq.setInterceptType("MODIFY_ADDR");
        ManInfo recManInfo = new ManInfo();
        recManInfo.setName("张三");
        recManInfo.setMobile("130******66");
        recManInfo.setPrintAddr("广东省深圳市南山区粤海街道科技南十二路金蝶软件园");
        interceptOrderReq.setRecManInfo(recManInfo);
        interceptOrderReq.setOrderRole("1");
        interceptOrderReq.setInterceptPayType("THIRDPARTY");
        interceptOrderReq.setSalt("kuaidi1000api@salt");
        interceptOrderReq.setCallbackUrl("http://api.kuaidi100.com/test/callback");
        String param = new Gson().toJson(interceptOrderReq);
        String t = System.currentTimeMillis() + "";
        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.INTERCEPTORDER);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));

    }

    /**
     * 地址解析接口
     *
     * @throws Exception
     */
    @Test
    public void  testAddressResolution() throws Exception {
        AddressResolutionParam addressResolutionParam = new AddressResolutionParam();
        //content 、image、imageUrl、pdfUrl、htmlUrl必填其一，优先顺序：content >image>imageUrl>padUrl>htmlUrl
        addressResolutionParam.setContent("张三广东省深圳市南山区粤海街道科技南十二路金蝶软件园13088888888");
        //image传base64编码
        // addressResolutionParam.setImage("");
        // addressResolutionParam.setImageUrl("http://api.kuaidi100.com/label/getImage/20240621/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        // addressResolutionParam.setPdfUrl("http://api.kuaidi100.com/label/xxx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        // addressResolutionParam.setHtmlUrl("http://api.kuaidi100.com/label/xxx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        String param = new Gson().toJson(addressResolutionParam);
        String t = System.currentTimeMillis() + "";
        AddressResolutionReq addressResolutionReq = new AddressResolutionReq();
        addressResolutionReq.setT(t);
        addressResolutionReq.setKey(key);
        addressResolutionReq.setSign(SignUtils.printSign(param,t,key,secret));
        addressResolutionReq.setParam(param);
        IBaseClient baseClient = new AddressResolution();
        System.out.println(baseClient.execute(addressResolutionReq));
    }

    /**
     * 国际地址解析接口
     *
     * @throws Exception
     */
    @Test
    public void  testIntAddressResolution() throws Exception {
        IntAddressResolutionParam intAddressResolutionParam = new IntAddressResolutionParam();
        intAddressResolutionParam.setCode("US");
        intAddressResolutionParam.setAddress("5430 Fredericksburg Rd Ste 310 San Antonio TX 78229 USA");
        intAddressResolutionParam.setLanguage("zh");
        String param = new Gson().toJson(intAddressResolutionParam);
        String t = System.currentTimeMillis() + "";
        AddressResolutionReq req = new AddressResolutionReq();
        req.setT(t);
        req.setKey(key);
        req.setSign(SignUtils.printSign(param,t,key,secret));
        req.setParam(param);
        IBaseClient baseClient = new IntAddressResolution();
        System.out.println(baseClient.execute(req));
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
    
            Map<String,Object> customParam = new HashMap<>();
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
     * 电子面单取消（V2）
     * @throws Exception
     */
    @Test
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

        IBaseClient baseClient = new LabelV2();
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
         * 国际电子面单下单API
         * 
         * @throws Exception
         */
        @Test
        public void testShipment() throws Exception {
            ShipmentReq shipmentReq = new ShipmentReq();
            shipmentReq.setPartnerId("");
            shipmentReq.setPartnerKey("");
            shipmentReq.setPartnerSecret("");
            shipmentReq.setCode("");
            shipmentReq.setKuaidicom("fedex");
            shipmentReq.setCargo("invoice");
            shipmentReq.setExpType("FedEx International First®");
            shipmentReq.setUnitOfMeasurement("SU");
            shipmentReq.setWeight(50.00);
            shipmentReq.setCustomsValue(1000.00);
    
            ManInfo sendMan = new ManInfo();
            sendMan.setName("test");
            sendMan.setMobile("16888888888");
            sendMan.setCountryCode("CN");
            sendMan.setCity("SHENZHEN");
            sendMan.setAddr("Kingdee Software Park");
            sendMan.setDistrict("Hi-tech Park,Nanshang District");
            sendMan.setZipcode("518057");
            sendMan.setEmail("test@qq.com");
            shipmentReq.setSendMan(sendMan);
    
            ManInfo recMan = new ManInfo();
            recMan.setName("test");
            recMan.setMobile("16888888888");
            recMan.setCountryCode("US");
            recMan.setCity("NEW YORK");
            recMan.setAddr(" 70 Washington Square South");
            recMan.setZipcode("10012");
            recMan.setEmail("test@qq.com");
            recMan.setStateOrProvinceCode("NY");
            shipmentReq.setRecMan(recMan);
    
            List<PackageInfo> packageInfoList = new ArrayList<>();
            PackageInfo packageInfo = new PackageInfo();
            packageInfo.setLength(10.00);
            packageInfo.setWidth(20.00);
            packageInfo.setHeight(10.00);
            packageInfo.setWeight(50.00);
            packageInfoList.add(packageInfo);
            shipmentReq.setPackageInfos(packageInfoList);
    
            List<ExportInfo> exportInfoList = new ArrayList<>();
            ExportInfo exportInfo = new ExportInfo();
            exportInfo.setDesc("test");
            exportInfo.setGrossWeight(50.00);
            exportInfo.setQuantity(1);
            exportInfo.setUnitPrice(1000.00);
            exportInfo.setQuantityUnitOfMeasurement("PCS");
            exportInfo.setManufacturingCountryCode("CN");
            exportInfoList.add(exportInfo);
            shipmentReq.setExportInfos(exportInfoList);
    
            CustomsClearance customsClearance = new CustomsClearance();
            customsClearance.setPurpose("GIFT");
            customsClearance.setDocument(true);
    
            String param = new Gson().toJson(shipmentReq);
            String t = System.currentTimeMillis() + "";
            String sign = SignUtils.printSign(param,t,key,secret);
    
            PrintReq printReq = new PrintReq();
            printReq.setKey(key);
            printReq.setMethod(ApiInfoConstant.ELECTRONIC_ORDER_PIC_METHOD);
            printReq.setSign(sign);
            printReq.setParam(param);
            printReq.setT(t);
    
            IBaseClient baseClient = new InternationalShipment();
            //国际面单耗时比较长，尽量调整10s以上
            baseClient.setTimeOut(1000,10000);
            System.out.println(baseClient.execute(printReq));
        }
        /**
         * 获取店铺授权超链接接口
         *
         * @throws Exception
         */
        @Test
        public void testStoreAuth() throws Exception {
            StoreAuthReq storeAuthReq = new StoreAuthReq();
            storeAuthReq.setShopType(ThirdPlatformConstant.TAO_BAO);
            storeAuthReq.setCallbackUrl("http://www.baidu.com");
            storeAuthReq.setSalt("12345678");
            String param = new Gson().toJson(storeAuthReq);
    
            PrintReq printReq = new PrintReq();
            printReq.setKey(key);
            printReq.setSign(SignUtils.sign(param + key + secret));
            printReq.setParam(param);
    
            IBaseClient baseClient = new ThirdPlatformStoreAuth();
            HttpResult result = baseClient.execute(printReq);
            System.out.println(result);
            if (result!=null && result.getStatus() == HttpStatus.SC_OK && result.getBody()!= null){
                ThirdPlatformBaseResp<StoreAuthResp> storeAuthResp = new Gson().fromJson(result.getBody(),new TypeToken<ThirdPlatformBaseResp<StoreAuthResp>>(){}.getType());
            }
        }
    
        /**
         * 提交订单获取任务接口
         *
         * @throws Exception
         */
        @Test
        public void testCommitTask() throws Exception {
            CommitTaskReq commitTaskReq = new CommitTaskReq();
            commitTaskReq.setShopType(ThirdPlatformConstant.TAO_BAO);
            commitTaskReq.setShopId("21231");
            commitTaskReq.setOrderStatus(OrderStatus.UNSHIP.toString());
            commitTaskReq.setUpdateAtMin("2022-02-17 16:00:00");
            commitTaskReq.setUpdateAtMax("2022-02-17 16:30:00");
            commitTaskReq.setCallbackUrl("http://www.baidu.com");
            commitTaskReq.setSalt("12345678");
            String param = new Gson().toJson(commitTaskReq);
    
            PrintReq printReq = new PrintReq();
            printReq.setKey(key);
            printReq.setSign(SignUtils.sign(param + key + secret));
            printReq.setParam(param);
    
            IBaseClient baseClient = new ThirdPlatformOrderCommitTask();
            HttpResult result = baseClient.execute(printReq);
            System.out.println(result);
            if (result!=null && result.getStatus() == HttpStatus.SC_OK && result.getBody()!= null){
                ThirdPlatformBaseResp<CommitTaskResp> commitTaskResp = new Gson().fromJson(result.getBody(),new TypeToken<ThirdPlatformBaseResp<CommitTaskResp>>(){}.getType());
            }
        }
    
        /**
         * 快递单号回传及订单发货接口
         *
         * @throws Exception
         */
        @Test
        public void testUploadNum() throws Exception {
            UploadNumReq uploadNumReq = new UploadNumReq();
            uploadNumReq.setShopType(ThirdPlatformConstant.TAO_BAO);
            uploadNumReq.setShopId("2333");
            uploadNumReq.setOrderNum("1232321");
            uploadNumReq.setKuaidiCom(CompanyConstant.YD);
            uploadNumReq.setKuaidiNum("12345678");
            String param = new Gson().toJson(uploadNumReq);
    
            PrintReq printReq = new PrintReq();
            printReq.setKey(key);
            printReq.setSign(SignUtils.sign(param + key + secret));
            printReq.setParam(param);
    
            IBaseClient baseClient = new ThirdPlatformOrderUploadNum();
            HttpResult result = baseClient.execute(printReq);
            System.out.println(result);
            if (result!=null && result.getStatus() == HttpStatus.SC_OK && result.getBody()!= null){
                ThirdPlatformBaseResp baseResp = new Gson().fromJson(result.getBody(),new TypeToken<ThirdPlatformBaseResp>(){}.getType());
            }
        }
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
     
             IBaseClient baseClient = new ExpressReachable();
             System.out.println(baseClient.execute(printReq));
     
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

    /**
     * 价格查询接口
     *
     * @throws Exception
     */
    @Test
    public void  testPriceQuery() throws Exception {
        PrintReq printReq = new PrintReq();
        PriceQueryParam priceQueryParam = new PriceQueryParam();
        priceQueryParam.setSendAddr("深圳南山区");
        priceQueryParam.setRecAddr("北京海淀区");
        priceQueryParam.setKuaidicom("jd");
        priceQueryParam.setWeight(1.0);
        String param = new Gson().toJson(priceQueryParam);
        String t = System.currentTimeMillis() + "";
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.PRICE);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);
        IBaseClient baseClient = new PriceQuery();
        System.out.println(baseClient.execute(printReq));
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
