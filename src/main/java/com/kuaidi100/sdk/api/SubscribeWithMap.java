package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.request.SubscribeReq;
import com.kuaidi100.sdk.response.SubscribeResp;
import com.kuaidi100.sdk.response.SubscribeWithMapPushParamResp;
import com.kuaidi100.sdk.utils.SignUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

// 移除servlet依赖 - 不再需要HttpServletRequest

/**
 * 订阅(地图)
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-16 14:38
 */
public class SubscribeWithMap extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.SUBSCRIBE_WITH_MAP_URL;
    }

    /**
     * 订阅接口
     *
     * @param subscribeReq
     * @return
     */
    public SubscribeResp  subscribe(SubscribeReq subscribeReq) throws Exception{
        HttpResult httpResult = execute(subscribeReq);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
           return new Gson().fromJson(httpResult.getBody(), SubscribeResp.class);
        }
        return null;
    }

    /**
     * 订阅推送处理(参照) - 重构版本，不依赖servlet-api
     * 订阅成功后，如果该快递单号有轨迹（包括已经签收的单），快递100将会在15分钟-4个小时推送；后面将会4个小时跟踪一次，跟踪到有轨迹变化则推送；
     * 如果订阅成功后，3天查无结果（录错单/快递公司错了/揽收比较晚），快递100将会推送3天查无结果，可以继续重新订阅。
     *
     * 返回值必须是下面这样的格式，否则快递100将认为该推送失败，快递100将会重试3次该推送，时间间隔35分钟；
     * 成功结果返回例子： {"result":true,"returnCode":"200","message":"提交成功"}
     *
     * @param param 快递100推送的参数内容
     * @param sign 快递100推送的签名
     * @return: com.kuaidi100.sdk.response.SubscribeResp
     * @author: api.kuaidi100.com
     * @time: 2020/7/16 19:48
     */
    public SubscribeResp callBackUrl(String param, String sign){
        //建议记录一下这个回调的内容，方便出问题后双方排查问题
        //log.debug("快递100订阅推送回调结果|{}|{}",param,sign);
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
            SubscribeWithMapPushParamResp mapPushParamResp = new Gson().fromJson(param, SubscribeWithMapPushParamResp.class);
            return subscribeResp;
        }
        return null;
    }
}
