package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * @description : 同城寄件请求封装类
 * @author: api.kuaidi100.com
 * @date: 2023/3/7
 * @version:
 */
public class BsameCityExpress extends BaseClient {
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.BSAMECITY_URL;
    }
}
