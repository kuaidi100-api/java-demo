package com.kuaidi100.sdk.cloud;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.cloud.CloudBaseReq;
import com.kuaidi100.sdk.response.cloud.CloudBaseResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-11-20 10:36
 */
public class CloudBase<T> {
    public CloudBaseResp<T> execute(CloudBaseReq param) throws Exception{
        HttpResult httpResult = HttpUtils.doPost(ApiInfoConstant.CLOUD_NORMAL_URL, param);
        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<CloudBaseResp<T>>(){}.getType());
        }
        return null;
    }
}
