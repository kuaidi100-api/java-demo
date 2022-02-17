package com.kuaidi100.sdk.contant;

/**
 * @Author: ligl
 * @Date: 2022-02-17 17:21
 */
public enum OrderStatus {
    /**
     * 未付款
     */
    UNPAY,
    /**
     * 待发货（默认值）
     */
    UNSHIP,
    /**
     * 等待卖家确认收货
     */
    SHIPED,
    /**
     * 交易成功/完成
     */
    FINISH,
    /**
     * 交易关闭/取消
     */
    CLOSE;


}
