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
     * 轨迹地图链接
     */
    private String trailUrl;
    /**
     * 预计到达时间
     */
    private String arrivalTime;
    /**
     * 平均耗时
     */
    private String totalTime;
    /**
     * 到达还需多少时间
     */
    private String remainTime;
}
