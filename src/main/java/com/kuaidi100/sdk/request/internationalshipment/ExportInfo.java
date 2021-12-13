package com.kuaidi100.sdk.request.internationalshipment;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2021-10-21 11:20
 */
@Data
public class ExportInfo {
    /**
     * 净重
     */
    private Double netWeight;
    /**
     * 毛重
     */
    private Double grossWeight;
    /**
     * 原产国国家代码,中国-CN,美国-US
     */
    private String manufacturingCountryCode;
    /**
     * 单位价格
     */
    private Double unitPrice;
    /**
     * 商品数量,INT 1 -1000000000,必须整数,小数dhl会报错,且不返回具体错误
     */
    private Integer quantity;
    /**
     * 计数单位,件-PCS;双-PRS;千克-KG;默认件
     */
    private String quantityUnitOfMeasurement;
    /**
     * 物品描述
     */
    private String desc;
    /**
     * 进口商品编码
     */
    private String importCommodityCode;
    /**
     * 出口商品编码
     */
    private String exportCommodityCode;
    /**
     * 件数
     */
    private int numberOfPieces;
    /**
     * sku
     */
    private String sku;
    /**
     * 产品的中文名
     */
    private String zhName;
    /**
     * 产品的英文名
     */
    private String enName;

}
