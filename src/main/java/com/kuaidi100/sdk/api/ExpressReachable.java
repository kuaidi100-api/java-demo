package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * 快递可用性
 *
 * @Author: ligl
 * @Date: 2022-11-04 10:02
 */
public class ExpressReachable extends BaseClient {

    private String apiUrl;

    /**
     * 主账户模式，使用默认可用性查询地址
     */
    public ExpressReachable() {
        this.apiUrl = ApiInfoConstant.REACHABLE_URL;
    }

    /**
     * 子账户模式，传入子账户专属请求地址
     *
     * @param apiUrl 子账户请求地址，如 {@link ApiInfoConstant#SUB_REACHABLE_URL}
     */
    public ExpressReachable(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    @Override
    public String getApiUrl(BaseRequest request) {
        return this.apiUrl;
    }
}
