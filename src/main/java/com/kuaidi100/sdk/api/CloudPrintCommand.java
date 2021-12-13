package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.response.PrintBaseResp;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2021年12月13日 11:13:45
 */
public class CloudPrintCommand extends BaseClient {

    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.ELECTRONIC_ORDER_PRINT_URL;
    }

    /**
     * 指令打印接口
     *
     * @param printReq
     * @author: api.kuaidi100.com
     * @time: 2021年12月13日 11:13:45
     */
    public PrintBaseResp print(PrintReq printReq) throws Exception{
        HttpResult httpResult = execute(printReq);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
           return new Gson().fromJson(httpResult.getBody(),PrintBaseResp.class);
        }
        return null;
    }
}
