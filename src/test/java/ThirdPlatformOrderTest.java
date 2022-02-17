import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.api.ThirdPlatformOrderCommitTask;
import com.kuaidi100.sdk.api.ThirdPlatformOrderUploadNum;
import com.kuaidi100.sdk.api.ThirdPlatformStoreAuth;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.contant.OrderStatus;
import com.kuaidi100.sdk.contant.ThirdPlatformConstant;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.request.ThirdPlatform.CommitTaskReq;
import com.kuaidi100.sdk.request.ThirdPlatform.StoreAuthReq;
import com.kuaidi100.sdk.request.ThirdPlatform.UploadNumReq;
import com.kuaidi100.sdk.response.ThirdPlatform.CommitTaskResp;
import com.kuaidi100.sdk.response.ThirdPlatform.StoreAuthResp;
import com.kuaidi100.sdk.response.ThirdPlatform.ThirdPlatformBaseResp;
import com.kuaidi100.sdk.utils.SignUtils;
import org.apache.http.HttpStatus;
import org.junit.Test;

/**
 * @Author: ligl
 * @Date: 2022-02-17 16:02
 */
public class ThirdPlatformOrderTest extends BaseServiceTest{

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
     * 获取店铺授权超链接接口
     *
     * @throws Exception
     */
    @Test
    public void testUploadNum() throws Exception {
        UploadNumReq uploadNumReq = new UploadNumReq();
        uploadNumReq.setShopType(ThirdPlatformConstant.TAO_BAO);
        uploadNumReq.setShopId("413979377");
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
}
