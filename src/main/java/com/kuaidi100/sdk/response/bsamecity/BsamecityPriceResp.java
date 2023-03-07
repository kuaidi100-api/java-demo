package com.kuaidi100.sdk.response.bsamecity;

import lombok.Data;

import java.util.List;

/**
 * @description : 同城寄件-预下单响应类
 * @author: api.kuaidi100.com
 * @date: 2023/3/7
 * @version:
 */
@Data
public class BsamecityPriceResp {
    /**
     * 任务ID，32位随机字符串，用于记录订单整个生命周期
     */
    private String taskId;
    /**
     * 配送距离	(单位：米)
     */
    private String deliveryDistance;
    /**
     * 配送费（原价）(单位：元)
     */
    private String deliverFee;
    /**
     * 配送费（折扣价）使用快递100下单享受的折扣价
     */
    private String discountFee;
    /**
     * 预计配送时间(单位: 秒)
     */
    private String estimateDeliveryTime;
    /**
     *  其他费用明细
     */
    private List<FeeDetail> otherFee;
}
