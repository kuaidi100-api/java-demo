package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.CloudPrintCustomParam;
import com.kuaidi100.sdk.request.BaseReq;
import com.kuaidi100.sdk.response.PrintBaseResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;

import java.net.URLEncoder;

/**
 * 自定义云打印
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-20 9:22
 */
public class CloudPrintCustom {

    public PrintBaseResp print(BaseReq<CloudPrintCustomParam> baseReq) throws Exception {
        String url = String.format(ApiInfoConstant.CLOUD_PRINT_URL,
                baseReq.getMethod(), baseReq.getT(),
                baseReq.getKey(), baseReq.getSign(),
                URLEncoder.encode(new Gson().toJson(baseReq.getParam()), "UTF-8"));
        HttpResult httpResult = HttpUtils.doPost(url, baseReq);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())) {

            return new Gson().fromJson(httpResult.getBody(), PrintBaseResp.class);
        }

        return null;
    }

}
