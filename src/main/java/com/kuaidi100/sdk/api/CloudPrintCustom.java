package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.CloudPrintCustomParam;
import com.kuaidi100.sdk.request.PrintBaseReq;
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

    public PrintBaseResp print(PrintBaseReq<CloudPrintCustomParam> printBaseReq) throws Exception {
        String url = String.format(ApiInfoConstant.CLOUD_PRINT_URL,
                printBaseReq.getMethod(), printBaseReq.getT(),
                printBaseReq.getKey(), printBaseReq.getSign(),
                URLEncoder.encode(new Gson().toJson(printBaseReq.getParam()), "UTF-8"));
        HttpResult httpResult = HttpUtils.doPost(url, printBaseReq);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())) {

            return new Gson().fromJson(httpResult.getBody(), PrintBaseResp.class);
        }

        return null;
    }

}
