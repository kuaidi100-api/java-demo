package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.request.pickupCode.PickupCodeRegisterParam;
import com.kuaidi100.sdk.request.pickupCode.PickupCodeQueryParam;
import com.kuaidi100.sdk.utils.SignUtils;

/**
 * 快递100 取件码服务
 * 包含：注册订阅、查询
 */
public class PickupCode extends BaseClient {

    private final String key;
    private final String secret;

    public PickupCode(String key, String secret) {
        this.key = key;
        this.secret = secret;
    }

    @Override
    public String getApiUrl(BaseRequest request) {
        if (request instanceof PrintReq) {
            String method = ((PrintReq) request).getMethod();
            if (ApiInfoConstant.PICKUP_CODE_REGISTER_METHOD.equals(method)) {
                return ApiInfoConstant.PICKUP_CODE_REGISTER_URL;
            } else if (ApiInfoConstant.PICKUP_CODE_QUERY_METHOD.equals(method)) {
                return ApiInfoConstant.PICKUP_CODE_QUERY_URL;
            }
        }
        return null;
    }

    /**
     * 注册/订阅取件码
     *
     * @param param 请求参数对象
     * @return HttpResult 原始HTTP响应结果(包含status和body)
     * @throws Exception 异常
     */
    public HttpResult register(PickupCodeRegisterParam param) throws Exception {
        String t = String.valueOf(System.currentTimeMillis());
        String paramJson = new Gson().toJson(param);
        String sign = SignUtils.printSign(paramJson, t, key, secret);

        PrintReq request = new PrintReq();
        request.setMethod(ApiInfoConstant.PICKUP_CODE_REGISTER_METHOD);
        request.setKey(key);
        request.setSign(sign);
        request.setT(t);
        request.setParam(paramJson);

        return execute(request);
    }

    /**
     * 查询取件码
     *
     * @param param 请求参数对象
     * @return HttpResult 原始HTTP响应结果(包含status和body)
     * @throws Exception 异常
     */
    public HttpResult query(PickupCodeQueryParam param) throws Exception {
        String t = String.valueOf(System.currentTimeMillis());
        String paramJson = new Gson().toJson(param);
        String sign = SignUtils.printSign(paramJson, t, key, secret);

        PrintReq request = new PrintReq();
        request.setMethod(ApiInfoConstant.PICKUP_CODE_QUERY_METHOD);
        request.setKey(key);
        request.setSign(sign);
        request.setT(t);
        request.setParam(paramJson);

        return execute(request);
    }

}
