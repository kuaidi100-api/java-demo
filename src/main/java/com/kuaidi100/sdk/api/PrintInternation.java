package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.response.PrintInternationResp;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;


/**
 * @author Mali
 * @since 2021/7/21 14:56
 */
public class PrintInternation extends BaseClient {
    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.ELECTRONIC_INTERSHIP_URL;
    }

    public PrintInternationResp print(PrintReq printReq) throws Exception {
        HttpResult httpResult = execute(printReq);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())) {

            return new Gson().fromJson(httpResult.getBody(), PrintInternationResp.class);
        }
        return null;
    }
}
