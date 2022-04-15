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
 * 复打
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-20 9:26
 */
public class CloudPrintOld extends BaseClient {

    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.ELECTRONIC_ORDER_PRINT_URL;
    }



    public PrintBaseResp print(PrintReq request) throws Exception{
        HttpResult httpResult = this.execute(request);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){

            return new Gson().fromJson(httpResult.getBody(),PrintBaseResp.class);
        }
        return null;
    }

}
