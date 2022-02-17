package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.response.BOrderQueryData;
import com.kuaidi100.sdk.response.BOrderResp;
import com.kuaidi100.sdk.response.PrintBaseResp;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

import java.util.Map;

/**
 * 商家寄件(优选寄件) 该接口功能目前已下线
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-09-17 11:14
 */
@Deprecated
public class BOrder extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.B_ORDER_URL;
    }

    public PrintBaseResp transportCapacity(PrintReq param) throws Exception{
        HttpResult httpResult = execute(param);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<BOrderQueryData>>(){}.getType());
        }
        return null;
    }

    public PrintBaseResp order(PrintReq param) throws Exception{
        HttpResult httpResult = execute(param);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<BOrderResp>>(){}.getType());
        }
        return null;
    }

    public PrintBaseResp getCode(PrintReq param) throws Exception{
        HttpResult httpResult = execute(param);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<Map<String,String>>>(){}.getType());
        }
        return null;
    }

    public PrintBaseResp cancel(PrintReq param) throws Exception{
        HttpResult httpResult = execute(param);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp>(){}.getType());
        }
        return null;
    }

}
