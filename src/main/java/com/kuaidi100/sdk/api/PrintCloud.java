package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.response.PrintBaseResp;
import com.kuaidi100.sdk.response.PrintCloudData;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 15:46
 */
@Deprecated
public class PrintCloud extends BaseClient {

    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.ELECTRONIC_ORDER_PRINT_URL;
    }

    /**
     * 电子面单打印
     *
     * @param printReq
     * @author: api.kuaidi100.com
     * @time: 2020/7/17 17:15
     */
    public PrintBaseResp<PrintCloudData> print(PrintReq printReq) throws Exception{
        HttpResult httpResult = execute(printReq);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
           return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<PrintCloudData>>(){}.getType());
        }
        return null;
    }
}
