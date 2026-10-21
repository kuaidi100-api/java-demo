package com.kuaidi100.sdk.request.labelV2;

import lombok.Data;

@Data
public class City56ChannelInfo {

    /**
     * 接口类型，0：药品，1：样本/试剂
     */
    private String cargoType;

    /**
     * 项目号
     */
    private String itemNo;

    /**
     * 要求到货时间
     */
    private Long reqDeliveryTime;
}
