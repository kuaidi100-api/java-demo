package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * @Author: ligl
 * @Date: 2022-04-26 15:52
 */
public class ThirdPlatformRest extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.ELECTRONIC_ORDER_HTML_URL;
    }
}
