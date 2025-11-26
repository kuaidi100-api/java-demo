package com.kuaidi100.sdk.request.pickupCode;

import lombok.Data;

@Data
public class PickupCodeRegisterParam {
    /**
     * 快递公司编码 (必填)
     */
    private String kuaidicom;
    /**
     * 快递单号 (必填)
     */
    private String kuaidinum;
    /**
     * 快递单号对应的收件人手机号 (必填)
     */
    private String receiverPhone;
    /**
     * 接收取件码信息的回调地址 (必填)
     */
    private String callbackUrl;
}