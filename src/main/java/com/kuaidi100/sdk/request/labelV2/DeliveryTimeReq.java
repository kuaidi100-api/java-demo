package com.kuaidi100.sdk.request.labelV2;

import lombok.Data;

/**
 * @description : 快递预估时效查询请求类
 * @author:  kuaidi100
 * @date: 2023/10/10
 * @version:
 */
@Data
public class DeliveryTimeReq {
    /**
     * 快递公司编码
     */
    private String kuaidicom;
    /**
     * 出发地（地址需包含3级及以上），例如：广东深圳南山区
     */
    private String from;
    /**
     * 目的地（地址需包含3级及以上），例如：北京海淀区
     */
    private String to;
    /**
     * 下单时间，格式要求yyyy-MM-dd HH:mm:ss, 例如：2023-08-08 08:08:08
     */
    private String orderTime;
    /**
     * 产品类型
     */
    private String expType;

}
