package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.CloudPrintAttachmentReq;
import com.kuaidi100.sdk.response.PrintBaseResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;

import java.net.URLEncoder;
import java.util.Map;

/**
 * 附件云打印
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-20 9:26
 */
public class CloudPrintAttachment{

    public PrintBaseResp print(CloudPrintAttachmentReq cloudPrintAttachmentReq) throws Exception{
        String url = String.format(ApiInfoConstant.CLOUD_PRINT_URL,
                cloudPrintAttachmentReq.getMethod(),
                cloudPrintAttachmentReq.getT(),
                cloudPrintAttachmentReq.getKey(),
                cloudPrintAttachmentReq.getSign(),
                URLEncoder.encode(new Gson().toJson(cloudPrintAttachmentReq.getParam()),"UTF-8"));
        HttpResult httpResult = HttpUtils.doPostFile(url, cloudPrintAttachmentReq.getFile());
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<Map<String,String>>>(){}.getType());
        }
        return null;
    }
}
