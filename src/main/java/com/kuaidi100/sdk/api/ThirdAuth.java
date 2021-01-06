package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * 第三方平台账号授权
 *
 * @Author: api.kuaidi100.com
 * @Date: 2021-01-06 14:12
 */
public class ThirdAuth extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.THIRD_AUTH_URL;
    }
}
