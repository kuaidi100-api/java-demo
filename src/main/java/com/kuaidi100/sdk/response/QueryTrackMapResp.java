package com.kuaidi100.sdk.response;

import lombok.Data;
import lombok.ToString;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-12-24 17:34
 */
@Data
@ToString(callSuper = true)
public class QueryTrackMapResp extends QueryTrackResp {

    /**
     * 轨迹地图链接，目前当入参resultv2=7时，会返回null
     */
    private String trailUrl;
}
