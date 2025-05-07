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

```xml
	<dependency>
        <groupId>com.github.kuaidi100-api</groupId>
        <artifactId>sdk</artifactId>
        <version>1.0.15</version>
    </dependency>
```

### Use Junit Test

以下是各个接口的测试示例，完整代码可在GitHub仓库中查看：

- [实时快递查询接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L54)

- [快递查询地图轨迹](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L75)

- [订阅接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L102)

- [智能识别接口（正式用户可以使用）](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L125)

- [电子面单下单接口(V2)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L140)

- [运单附件查询接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L184)

- [订单拦截接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L211)

- [地址解析接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L249)

- [国际地址解析接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L275)

- [云打印复打(V2)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L298)

- [自定义打印(V2)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L323)

- [电子面单取消（V2）](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L352)

- [快递预估时效](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L385)

- [电子面单图片接口(v1版本示例，后续不维护新功能，建议使用v2)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L412)

- [电子面单HTML接口(v1版本示例，后续不维护新功能，建议使用v2)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L444)

- [电子面单打印接口(v1版本示例，后续不维护新功能，建议使用v2)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L483)

- [云打印自定义(v1版本示例，后续不维护新功能，建议使用v2)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L520)

- [附件打印接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L544)

- [复打(v1版本示例，建议使用v2)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L568)

- [第三方平台账号授权](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L590)

- [快递100短信发送接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L613)

- [C端查询运力(云平台接口)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L633)

- [C端寄件(云平台接口)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L648)

- [C端取消寄件(云平台接口)](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L674)

- [发货单接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L693)

- [快递面单OCR识别接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L722)

- [快递可用性查询](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L744)

- [商家寄件 - 相关接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BOrderOfficialTest.java)
- [同城寄件-预下单](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L777)

- [同城寄件-下单](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L831)

- [同城寄件-预取消](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L887)

- [同城寄件-取消](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L915)

- [同城寄件-加小费](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L943)
- [C端寄件](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/COrderTest.java)

- [价格查询接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/BaseServiceTest.java#L971)

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
