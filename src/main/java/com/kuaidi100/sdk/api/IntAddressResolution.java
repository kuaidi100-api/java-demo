package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.AddressResolutionReq;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.response.intAddressResolution.IntAddressResolutionResp;
import com.kuaidi100.sdk.response.labelV2.Result;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

/**
 * @description:
 * @author: api.kuaidi100.com
 * @date: 2024/6/24
 * @version: 1.0.0
 */
public class IntAddressResolution extends BaseClient {
    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.INTADDRESS_RESOLUTION_URL;
    }

    /**
     *
     * @param addressResolutionReq
     * @return
     * @throws Exception
     */
    public Result<IntAddressResolutionResp> resolution(AddressResolutionReq addressResolutionReq) throws Exception{
        HttpResult httpResult = execute(addressResolutionReq);

        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<Result<IntAddressResolutionResp>>(){}.getType());
        }
        return null;
    }
}
