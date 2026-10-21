package com.kuaidi100.sdk.request.labelV2;

import lombok.Data;

@Data
public class ShunFengChannelInfo {

    /**
     * 顺丰签回单二次下单需要的数据
     * =========================================================
     * //第一程返参回单号
     */
    private String waybillNo;
    /**
     * 第一程返参母单号
     */
    private String backnumOriNum;
    /*==========================================================*/
}
