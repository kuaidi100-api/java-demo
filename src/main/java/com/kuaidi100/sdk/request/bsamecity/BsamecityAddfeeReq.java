package com.kuaidi100.sdk.request.bsamecity;

import lombok.Data;

/**
 * @description : 同城寄件-加小费请求类
 * @author: api.kuaidi100.com
 * @date: 2023/3/7
 * @version:
 */
@Data
public class BsamecityAddfeeReq {
    /**
     * 下单时返回的orderId
     */
    private String orderId;

    /**
     * 下单时返回的taskId
     */
    private String taskId;

    /**
     * 订单小费，单位元
     */
    private String tips;

    /**
     * 备注
     */
    private String remark;

}
