package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.response.PrintBaseResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

import java.net.URLEncoder;

/**
 * 复打
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-20 9:26
 */
public class CloudPrintOld extends BaseClient {

    public String getApiUrl(BaseRequest request) {
        return null;
    }

    @Override
    public HttpResult execute(BaseRequest request) throws Exception{
        if (request instanceof PrintReq){
            PrintReq printReq = (PrintReq)request;
            String url = String.format(ApiInfoConstant.CLOUD_PRINT_URL,
                    printReq.getMethod(),
                    printReq.getT(),
                    printReq.getKey(),
                    printReq.getSign(),
                    URLEncoder.encode(printReq.getParam(), "UTF-8"));
            return HttpUtils.doPost(url,printReq);
        }
        throw new ClassCastException();
    }

    public PrintBaseResp print(PrintReq request) throws Exception{
        HttpResult httpResult = this.execute(request);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){

            return new Gson().fromJson(httpResult.getBody(),PrintBaseResp.class);
        }
        return null;
    }

}
