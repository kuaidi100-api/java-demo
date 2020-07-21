package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.SendSmsReq;
import com.kuaidi100.sdk.response.SendSmsResp;
import com.kuaidi100.sdk.response.SmsCallbackResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-20 19:00
 */
public class SendSms {
    private static Logger log = LoggerFactory.getLogger(SendSms.class);
    /**
     * 发送短信
     *
     * @param sendSmsReq
     * @return
     */
    public SendSmsResp sendSms(SendSmsReq sendSmsReq){
        HttpResult httpResult = HttpUtils.doPost(ApiInfoConstant.SEND_SMS_URL, sendSmsReq);
        System.out.println(httpResult.getBody());
        if (httpResult.getBody()!= null && httpResult.getStatus() == 200){
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
