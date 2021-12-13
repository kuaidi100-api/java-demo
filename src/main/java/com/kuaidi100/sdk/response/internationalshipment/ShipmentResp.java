package com.kuaidi100.sdk.response.internationalshipment;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2021-08-09 17:27
 */
@Data
public class ShipmentResp {
    /**
     * 快递单号
     */
    private String kuaidinum;
    /**
     * 面单信息对象
     */
    private Document label;
    /**
     * 发票对象信息
     */
    private Document invoice;
    /**
     * 包裹号,多个包裹号用英文逗号分隔
     */
    private String pkgNums;
    /**
     * 子单号,多个包裹用英文逗号分隔
     */
    private String subNums;
}
