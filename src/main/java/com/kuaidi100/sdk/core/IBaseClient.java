package com.kuaidi100.sdk.core;

import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.response.BaseResponse;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-11-25 16:09
 */
public interface IBaseClient {

    HttpResult execute(BaseRequest request) throws Exception;

    BaseResponse executeToObject(BaseRequest request) throws Exception;
}
