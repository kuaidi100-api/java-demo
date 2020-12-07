package com.kuaidi100.sdk.cloud;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.cloud.CloudBaseReq;
import com.kuaidi100.sdk.response.cloud.CloudBaseResp;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-11-20 10:36
 */
public class CloudBase<T> extends BaseClient {

    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.CLOUD_NORMAL_URL;
    }

    public CloudBaseResp<T> executeToObject(CloudBaseReq param) throws Exception{
        HttpResult httpResult = execute(param);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<CloudBaseResp<T>>(){}.getType());
        }
        return null;
    }
}
