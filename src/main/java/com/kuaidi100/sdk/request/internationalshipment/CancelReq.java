package com.kuaidi100.sdk.request.internationalshipment;


import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2021-10-21 11:20
 */
@Data
public class CancelReq {
    /**
     * 快遞單號
     */
    private String kuaidicom;
    /**
     * 快遞單號
     */
    private String kuaidinum;
    /**
     * 訂單id
     */
    private String orderId;
    /**
     * 驗證信息
     */
    private ValidateInfo vi;
    /**
     * 驗證信息
     */
    private String openid;
    /**
     * 取消原因
     */
    private String reason;
}
