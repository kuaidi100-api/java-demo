package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * @Author: ligl
 * @Date: 2022-02-17 11:23
 */
public class CloudPrintParcelsBill extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.BILL_PARCELS_URL;
    }
}
