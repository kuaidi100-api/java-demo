package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2025-07-07
 */
@Data
public class PredictedRoute {
    /**
     * 到达节点时间，格式为："2025-04-16 10:36:46"
     */
    private String arriveTime;

    /**
     * 离开节点时间，格式为："2025-04-16 10:39:03"
     */
    private String leaveTime;

    /**
     * 节点所在省，例如"湖北"
     */
    private String province;

    /**
     * 节点所在市，例如"宜昌市"
     */
    private String city;

    /**
     * 节点所在区，例如"点军区"
     */
    private String district;

    /**
     * 节点名称，例如"武汉转运中心"
     */
    private String name;

    /**
     * 当前节点状态：已经过节点、当前停留节点、预估途径节点
     */
    private String state;

    /**
     * 当前节点类型：转运中心、网点
     */
    private String type;
}

