# 快递综合服务平台

本仓库正在原快递100 Java SDK 基础上扩展多模块平台。原 SDK 的 `src/` 与根目录
`pom.xml` 保持原位，作为独立物流适配基础，不会由业务后端直接调用真实下单接口。

当前阶段已提供 NestJS API、Prisma 数据模型、MySQL/Redis Docker Compose、Swagger、
JWT 登录、地址与模拟订单最小接口。用户端、配送员端、管理后台仅建立边界目录，页面开发
将在后续确认后进行。

## 本地启动

前置条件：Node.js 20+、npm 10+、Docker Desktop。

```powershell
Copy-Item .env.example .env  # 首次启动；一键脚本也会自动创建
.\scripts\start-local.cmd
```

- API 健康检查：`http://localhost:3000/api/v1/health`
- Swagger：`http://localhost:3000/docs`
- 停止基础设施：`.\scripts\stop-local.ps1`
- 完整设计：[docs/architecture.md](docs/architecture.md)
- 数据模型：[docs/data-model.md](docs/data-model.md)
- 状态机：[docs/order-state-machine.md](docs/order-state-machine.md)

开发环境固定显示“模拟环境”；快递100正式接口、短信、支付与 Google Maps 未配置时均不会
执行真实外部操作。任何密钥只允许写入已被 Git 忽略的 `.env`。

`.env.example` 中的演示账号和演示密码只用于本地种子数据，禁止在生产环境复用；前端不会
预填密码，也不会把 Access Token、Refresh Token 或敏感配置写入日志。客户端只读取
`VITE_API_BASE_URL` 等公开配置，任何密钥都不得使用 `VITE_` 前缀。

---

## 原快递100 Java SDK 说明

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
	implementation 'com.github.kuaidi100-api:sdk:1.1.3'
}
```

#### Maven

```xml
    <dependency>
        <groupId>com.github.kuaidi100-api</groupId>
        <artifactId>sdk</artifactId>
        <version>1.1.3</version>
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

- [取件码接口](https://github.com/kuaidi100-api/java-demo/blob/master/src/test/java/PickupCodeTest.java)

## FAQ

### 问题1.快递100api接口里sign该如何处理？

快递100加密方式统一为MD5后转大写，可以参考[签名](https://github.com/kuaidi100-api/kuadi100-api/blob/master/src/main/java/com/kuaidi100/sdk/utils/SignUtils.java)

```java
org.apache.commons.codec.digest.DigestUtils.md5Hex(msg).toUpperCase();
```

### 问题2.使用了快递100订阅接口后，该如何处理回调接口？

可以参考推送[订阅回调](https://github.com/kuaidi100-api/kuadi100-api/blob/master/src/main/java/com/kuaidi100/sdk/api/Subscribe.java#L56)

```java
public SubscribeResp callBackUrl(String param, String sign){
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

## Tips
如需获取账号信息（如 key、customer、secret），或免费试用100单，请访问[API开放平台](https://api.kuaidi100.com/register/diff/)进行注册

