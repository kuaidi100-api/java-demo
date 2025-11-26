package com.kuaidi100.sdk.response.pickupCode;

import lombok.Data;

@Data
public class PickupCodeQueryData {
    /**
     * 快递公司编码
     */
    private String kuaidicom;
    /**
     * 快递单号
     */
    private String kuaidinum;
    /**
     * 取件码
     */
    private String pickUpCode;
    /**
     * 驿站地址
     */
    private String pickUpAddress;
    /**
     * 驿站名称
     */
    private String pickUpStation;
    /**
     * 状态描述 (例如: "待提货")
     */
    private String statusDesc;
}