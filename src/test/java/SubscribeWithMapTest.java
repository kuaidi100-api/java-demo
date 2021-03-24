import com.google.gson.Gson;
import com.kuaidi100.sdk.api.SubscribeWithMap;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.request.SubscribeParam;
import com.kuaidi100.sdk.request.SubscribeParameters;
import com.kuaidi100.sdk.request.SubscribeReq;
import org.junit.Test;

/**
 * 订阅带地图版
 *
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 16:08
 */
public class SubscribeWithMapTest extends BaseServiceTest{

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
}
