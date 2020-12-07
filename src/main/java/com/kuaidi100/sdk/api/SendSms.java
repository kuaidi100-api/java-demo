package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.SendSmsReq;
import com.kuaidi100.sdk.response.SendSmsResp;
import com.kuaidi100.sdk.response.SmsCallbackResp;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-20 19:00
 */
public class SendSms extends BaseClient {
    private static Logger log = LoggerFactory.getLogger(SendSms.class);

    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.SEND_SMS_URL;
    }

    /**
     * 发送短信
     *
     * @param sendSmsReq
     * @return
     */
    public SendSmsResp sendSms(SendSmsReq sendSmsReq) throws Exception{
        HttpResult httpResult = execute(sendSmsReq);
        if (StringUtils.isNotBlank(httpResult.getBody()) && httpResult.getStatus() == HttpStatus.SC_OK){
            return new Gson().fromJson(httpResult.getBody(),SendSmsResp.class);
        }
        return null;
    }

    /**
     * 短信回调接口 例子
     * @param
     * @return: java.util.Map<java.lang.String, java.lang.Boolean>
     * @author: api.kuaidi100.com
     * @time: 2020/7/21 10:11
     */
    public Map<String,Boolean> callback(SmsCallbackResp smsCallbackResp){
        //建议记录一下这个回调的内容，方便出问题后双方排查问题
        log.debug("快递100短信回调结果|{}",new Gson().toJson(smsCallbackResp));
        Map<String,Boolean> result = new HashMap<String, Boolean>();
        if (smsCallbackResp == null){
            return result;
        }

        result.put("status",Boolean.TRUE);
        return result;
    }
}
