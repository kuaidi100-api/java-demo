package com.kuaidi100.sdk.response.border;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-08-17 17:18
 */
@Data
public class BOrderData {

    /**
     * 任务ID
     */
    private String taskId;
    /**
     * 订单ID
     */
    private String orderId;
    /**
     * 快递单号
     */
    private String kuaidinum;
    /**
     * 快递面单附属属性，根据各个快递公司返回属性,如有需要可使用该实体
     * {@link com.kuaidi100.sdk.response.labelV2.OrderResult}
     */
    private String eOrder;
}
