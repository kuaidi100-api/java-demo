package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.CloudPrintOldParam;
import com.kuaidi100.sdk.request.PrintBaseReq;
import com.kuaidi100.sdk.response.PrintBaseResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;

import java.net.URLEncoder;

/**
 * 复打
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-20 9:26
 */
public class CloudPrintOld {

    public PrintBaseResp print(PrintBaseReq<CloudPrintOldParam> cloudPrintOldParamReq) throws Exception{
        String url = String.format(ApiInfoConstant.CLOUD_PRINT_URL,
                cloudPrintOldParamReq.getMethod(),
                cloudPrintOldParamReq.getT(),
                cloudPrintOldParamReq.getKey(),
                cloudPrintOldParamReq.getSign(),
                URLEncoder.encode(new Gson().toJson(cloudPrintOldParamReq.getParam()),"UTF-8"));
        HttpResult httpResult = HttpUtils.doPost(url, cloudPrintOldParamReq);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){

            return new Gson().fromJson(httpResult.getBody(),PrintBaseResp.class);
        }
        return null;
    }
}
