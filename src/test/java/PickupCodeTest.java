import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.api.PickupCode;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.pickupCode.PickupCodeQueryParam;
import com.kuaidi100.sdk.request.pickupCode.PickupCodeRegisterParam;
import com.kuaidi100.sdk.response.labelV2.Result;
import com.kuaidi100.sdk.response.pickupCode.PickupCodeQueryData;
import com.kuaidi100.sdk.response.pickupCode.PickupCodeRegisterData;
import com.kuaidi100.sdk.utils.PropertiesReader;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.junit.Test;

public class PickupCodeTest {
    String key = PropertiesReader.get("key");
    String secret = PropertiesReader.get("secret");

    @Test
    public void testPickupCodeRegister() throws Exception {
        PickupCode pickupCodeApi = new PickupCode(key, secret);

        // 1. 构造订阅请求参数
        PickupCodeRegisterParam param = new PickupCodeRegisterParam();
        param.setKuaidicom("yuantong");
        param.setKuaidinum("YT2574351128070");
        param.setReceiverPhone("17702536051");
        param.setCallbackUrl("http://www.your-domain.com/callback");

        // 2. 发送请求
        HttpResult result = pickupCodeApi.register(param);

        // 3. 打印结果
        System.out.println(result);

        // 4. 业务处理
        if (result.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(result.getBody())) {
            // 使用 SDK 提供的 Result 和 Data 类进行强类型解析
            Result<PickupCodeRegisterData> resultObj = new Gson().fromJson(
                    result.getBody(),
                    new TypeToken<Result<PickupCodeRegisterData>>(){}.getType()
            );

            // 根据业务错误码判断逻辑
            if (resultObj.getCode() == 200) {
                PickupCodeRegisterData data = resultObj.getData();
                System.out.println("任务ID: " + data.getTaskId());
            } else {
                System.out.println("业务失败: " + resultObj.getMessage());
            }
        } else {
            System.out.println("请求失败，HTTP 状态码: " + result.getStatus());
        }
    }

    @Test
    public void testPickupCodeQuery() throws Exception {
        PickupCode pickupCodeApi = new PickupCode(key, secret);

        // 1. 构造查询请求参数
        PickupCodeQueryParam param = new PickupCodeQueryParam();
        param.setKuaidicom("yuantong");
        param.setKuaidinum("YT2574212098809");
        param.setReceiverPhone("15575858699");

        // 2. 发送请求
        HttpResult result = pickupCodeApi.query(param);

        // 3. 打印结果
        System.out.println(result);

        // 4. 业务处理
        if (result.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(result.getBody())) {
            // 使用 SDK 提供的 Result 和 Data 类进行强类型解析
            Result<PickupCodeQueryData> resultObj = new Gson().fromJson(
                    result.getBody(),
                    new TypeToken<Result<PickupCodeQueryData>>(){}.getType()
            );

            // 根据业务错误码判断逻辑
            if (resultObj != null && resultObj.getCode() == 200) {
                PickupCodeQueryData data = resultObj.getData();
                if (data != null) {
                    System.out.println("取件码: " + data.getPickUpCode());
                    System.out.println("取件地址: " + data.getPickUpAddress());
                } else {
                    System.out.println(resultObj.getMessage());
                }
            } else {
                System.out.println("业务失败: " + (resultObj != null ? resultObj.getMessage() : "未知错误"));
            }
        } else {
            System.out.println("请求失败，HTTP 状态码: " + result.getStatus());
        }
    }
}
