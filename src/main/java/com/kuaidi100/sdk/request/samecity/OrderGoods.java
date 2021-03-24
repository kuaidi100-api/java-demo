package com.kuaidi100.sdk.request.samecity;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-09 10:15
 */
@Data
public class OrderGoods {
    /**
     * 商品名称
     */
    private String name;
    /**
     * 商品价格（分）
     */
    private Integer price;
    /**
     * 商品数量
     */
    private Integer count;
    /**
     * 商品单位
     */
    private String unit;
}
