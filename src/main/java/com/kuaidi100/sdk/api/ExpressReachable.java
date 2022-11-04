package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * @Author: ligl
 * @Date: 2022-11-04 10:02
 */
public class ExpressReachable extends BaseClient {
    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.REACHABLE_URL;
    }
}
