package com.kuaidi100.sdk.core;

import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.response.BaseResponse;
import com.kuaidi100.sdk.utils.HttpUtils;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-11-25 16:02
 */
public abstract class BaseClient implements IBaseClient{

    public HttpResult execute(BaseRequest request) throws Exception{

        return HttpUtils.doPost(getApiUrl(request),request);
    }

    public BaseResponse executeToObject(BaseRequest request) throws Exception{

        return null;
    }

    
    public abstract String getApiUrl(BaseRequest request);

}
