package com.kuaidi100.sdk.request.bsamecity;

import lombok.Data;

/**
 * @description : 同城寄件-取消订单请求类
 * @author: api.kuaidi100.com
 * @date: 2023/3/7
 * @version:
 */
@Data
public class BsamecityCancelReq {
    /**
     * 下单时返回的taskId
     */
    private String taskId;
    /**
     *订单id
     */
    private String orderId;
    /**
     *取消原因类型
     */
    private int cancelMsgType;
    /**
     *取消原因
     */
    private String cancelMsg;
}
