package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.PrintCloudReq;
import com.kuaidi100.sdk.request.PrintHtmlReq;
import com.kuaidi100.sdk.request.PrintImgReq;
import com.kuaidi100.sdk.response.PrintHtmlResp;
import com.kuaidi100.sdk.response.QueryTrackResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 17:20
 */
public class PrintHtml {

    /**
     * 电子面单打印
     *
     * @param printHtmlReq
     * @return: java.lang.String
     * @author: api.kuaidi100.com
     * @time: 2020/7/17 17:15
     */
    public PrintHtmlResp print(PrintHtmlReq printHtmlReq){
        HttpResult httpResult = HttpUtils.doPost(ApiInfoConstant.ELECTRONIC_ORDER_HTML_URL, printHtmlReq);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){

            return new Gson().fromJson(httpResult.getBody(),PrintHtmlResp.class);
        }
        return null;
    }
}
