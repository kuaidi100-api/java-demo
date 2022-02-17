package com.kuaidi100.sdk.request.ThirdPlatform;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-02-17 15:55
 */
@Data
public class CommitTaskReq {
    /**
     * 店铺类型，TAOBAO：淘宝，JINGDONG：京东，TOUTIAO：抖店，PINDUODUO：拼多多
     */
    private String shopType;
    /**
     * 店铺ID
     */
    private String shopId;
    /**
     * 订单状态，UNPAY：未付款；UNSHIP：待发货（默认值）；SHIPED：等待卖家确认收货；FINISH：交易成功/完成；CLOSE：交易关闭/取消
     */
    private String orderStatus;
    /**
     * 订单更新的最小时间，格式：yyyy-MM-dd HH:mm:ss
     */
    private String updateAtMin;
    /**
     * 订单更新的最大时间，格式：yyyy-MM-dd HH:mm:ss
     */
    private String updateAtMax;
    /**
     * 回调地址，默认仅支持http
     */
    private String callbackUrl;
    /**
     * 回调参数sign的加密参数，非空时回调才会有sign参数
     */
    private String salt;
}
