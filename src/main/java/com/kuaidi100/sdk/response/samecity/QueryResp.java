package com.kuaidi100.sdk.response.samecity;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-02 11:04
 */
@Data
public class QueryResp {
    /**
     * 骑手姓名(订单处于下单成功、取消状态下为空)
     */
    private String courierName;
    /**
     * 骑手电话(订单处于下单成功、已签收、取消状态下为空)
     */
    private String courierPhone;
    /**
     * 预计送达时间(订单处于下单成功、已签收、取消状态下为空)
     */
    private String predictDeliveryTime;
    /**
     * 地图链接(订单处于下单成功、已签收、取消状态下为空)
     */
    private String trailUrl;
    /**
     * 当前骑手维度(订单处于下单成功、已签收、取消状态下为空)
     */
    private String lat;
    /**
     * 当前骑手经度(订单处于下单成功、已签收、取消状态下为空)
     */
    private String lng;
    /**
     * 订单状态( 0-下单成功 1-已接单 10-已取货 13-已签收 9-用户主动取消 99-订单已取消)
     */
    private Integer status;
    /**
     * 快递公司
     */
    private String com;
    /**
     * 快递公司
     */
    private String num;
}
