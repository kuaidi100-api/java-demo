package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-14 16:14
 */
@Data
public class QueryTrackRouteInfo {
    /**
     * 出发位置
     */
    private QueryTrackPosition from;
    /**
     * 当前位置
     */
    private QueryTrackPosition cur;
    /**
     * 收货地
     */
    private QueryTrackPosition to;
}
