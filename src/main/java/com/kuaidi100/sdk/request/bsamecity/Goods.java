package com.kuaidi100.sdk.request.bsamecity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @description : 商品/货品明细类
 * @author: api.kuaidi100.com
 * @date: 2023/3/7
 * @version:
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Goods {
    /**
     * 商品名称
     */
    private String name;
    /**
     * 商品类型，参考物品类型
     */
    private String type;
    /**
     * 商品数量
     */
    private int count;
}
