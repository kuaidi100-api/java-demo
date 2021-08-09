package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * 出口信息 一般包裹类要求必填,文件类不用填,用于清关报备
 *
 * @author Mali
 * @since 2021/7/21 15:12
 */
@Data
public class ExportInfo {
    /**
     * 净重,单位kg,默认0.1
     */
    private Double netWeight;
    /**
     * 毛重,单位kg,默认 0.1
     */
    private Double grossWeight;
    /**
     * 	生产国代号;CN-中国,US-美国 必填
     */
    private String manufacturingCountryCode;
    /**
     * 	物品单价,货币单位根据currency确定,人民币单位是元 必填
     */
    private Double unitPrice;
    /**
     * 	物品数量,默认1.0 必填
     */
    private Double quantity;
    /**
     * 计数单位,必填;PCS-件,KG-千克等,默认PCS
     */
    private String quantityUnitOfMeasurement;
    /**
     * 物品描述 必填
     */
    private String desc;
}
