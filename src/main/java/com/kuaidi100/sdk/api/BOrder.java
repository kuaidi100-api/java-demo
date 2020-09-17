package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.BaseReq;
import com.kuaidi100.sdk.response.BOrderQueryData;
import com.kuaidi100.sdk.response.BOrderResp;
import com.kuaidi100.sdk.response.PrintBaseResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.Map;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-09-17 11:14
 */
public class BOrder {


    public PrintBaseResp transportCapacity(BaseReq param) throws Exception{
        param.setMethod(ApiInfoConstant.B_ORDER_QUERY_TRANSPORT_CAPACITY_METHOD);
        HttpResult httpResult = HttpUtils.doPost(ApiInfoConstant.B_ORDER_URL, param);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<BOrderQueryData>>(){}.getType());
        }
        return null;
    }

    public PrintBaseResp order(BaseReq param) throws Exception{
        param.setMethod(ApiInfoConstant.B_ORDER_SEND_METHOD);
        HttpResult httpResult = HttpUtils.doPost(ApiInfoConstant.B_ORDER_URL, param);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<BOrderResp>>(){}.getType());
        }
        return null;
    }

    public PrintBaseResp getCode(BaseReq param) throws Exception{
        param.setMethod(ApiInfoConstant.B_ORDER_CODE_METHOD);
        HttpResult httpResult = HttpUtils.doPost(ApiInfoConstant.B_ORDER_URL, param);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<Map<String,String>>>(){}.getType());
        }
        return null;
    }

    public PrintBaseResp cancel(BaseReq param) throws Exception{
        param.setMethod(ApiInfoConstant.B_ORDER_CANCEL_METHOD);
        HttpResult httpResult = HttpUtils.doPost(ApiInfoConstant.B_ORDER_URL, param);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp>(){}.getType());
        }
        return null;
    }

}
