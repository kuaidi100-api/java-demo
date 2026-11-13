package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * 快递信息地图轨迹
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-14 16:27
 */
public class QueryTrackMap extends BaseClient {

    private String apiUrl;

    /**
     * 主账户模式，使用默认地图轨迹查询地址
     */
    public QueryTrackMap() {
        this.apiUrl = ApiInfoConstant.QUERY_MAP_VIEW_URL;
    }

    /**
     * 子账户模式，传入子账户专属请求地址
     *
     * @param apiUrl 子账户请求地址，如 {@link ApiInfoConstant#SUB_QUERY_MAP_URL}
     */
    public QueryTrackMap(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    @Override
    public String getApiUrl(BaseRequest request) {
        return this.apiUrl;
    }

}
