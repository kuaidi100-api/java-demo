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
public  class QueryTrackMap extends BaseClient {

    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.QUERY_MAP_VIEW_URL;
    }

}
