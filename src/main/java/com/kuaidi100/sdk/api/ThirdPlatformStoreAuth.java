package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * 第三方平台订单店铺授权
 *
 * @Author: ligl
 * @Date: 2022-02-16 17:19
 */
public class ThirdPlatformStoreAuth extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.THIRD_PLATFORM_ORDER_SHOP_AUTHORIZE_url;
    }
}
