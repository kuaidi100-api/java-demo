package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * 同城配送
 *
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 16:37
 */
public class SameCityOrder extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.SAME_CITY_ORDER_URL;
    }
}
