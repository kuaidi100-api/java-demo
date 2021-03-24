package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * 商家寄件（官方快递）
 *
 * @Author: api.kuaidi100.com
 * @Date: 2021-01-21 15:55
 */
public class BOrderOfficial extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.B_ORDER_OFFICIAL_URL;
    }
}
