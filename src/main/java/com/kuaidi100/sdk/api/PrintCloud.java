package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.PrintCloudReq;
import com.kuaidi100.sdk.response.PrintBaseResp;
import com.kuaidi100.sdk.response.PrintCloudData;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 15:46
 */
public class PrintCloud {

    /**
     * 电子面单打印
     *
     * @param printCloudReq
     * @author: api.kuaidi100.com
     * @time: 2020/7/17 17:15
     */
    public PrintBaseResp<PrintCloudData> print(PrintCloudReq printCloudReq){
        HttpResult httpResult = HttpUtils.doPost(ApiInfoConstant.ELECTRONIC_ORDER_PRINT_URL, printCloudReq);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){

           return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<PrintCloudData>>(){}.getType());
        }
        return null;
    }
}
