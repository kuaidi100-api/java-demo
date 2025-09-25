package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.response.PrintBaseResp;
import com.kuaidi100.sdk.response.PrintImgData;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 15:46
 */
@Deprecated
public class PrintImg extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.ELECTRONIC_ORDER_PIC_URL;
    }

    /**
     * 获取电子面单图片（BASE64）
     *
     * @param printReq
     * @return: java.lang.String
     * @author: api.kuaidi100.com
     * @time: 2020/7/17 17:15
     */
    public PrintBaseResp<PrintImgData> printImG(PrintReq printReq) throws Exception{
        HttpResult httpResult = execute(printReq);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
           return new Gson().fromJson(httpResult.getBody(),new TypeToken<PrintBaseResp<PrintImgData>>(){}.getType());
        }
        return null;
    }

    /**
     * 处理返回的base64字符串（返回的是一个字符串json数组，多个子单时会有多个）
     *
     * @param imgBase64 base64 json字符串数组
     * @return
     */
    public List<String> getBase64Img(String imgBase64){
        List<String> stringList= new Gson().fromJson(imgBase64, new TypeToken<List<String>>() {}.getType());
        List<String> base64Img = new ArrayList<String>();
        if (stringList != null && stringList.size()>0){
            for (String s : stringList) {
                s = "data:image/png;base64,"+s.replace("\\\\n","");
                base64Img.add(s);
            }
        }
        return base64Img;
    }
}
