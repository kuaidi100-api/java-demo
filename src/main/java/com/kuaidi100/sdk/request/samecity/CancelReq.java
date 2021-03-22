package com.kuaidi100.sdk.request.samecity;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2021-03-22 17:24
 */
@Data
public class CancelReq {

    /**
     * 任务ID
     */
    private String taskId;
    /**
     * 订单ID
     */
    private String orderId;
    /**
     * 取消原因
     */
    private String cancelMsg;
}
