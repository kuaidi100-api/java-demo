package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * 快递员信息类
 */
@Data
public class CourierInfo {
    /**
     * 揽件快递员姓名
     */
    private String pickupManName;

    /**
     * 揽件快递员手机号
     */
    private String pickupManPhone;

    /**
     * 派件快递员姓名
     */
    private String deliveryManName;

    /**
     * 派件快递员手机号
     */
    private String deliveryManPhone;
}
