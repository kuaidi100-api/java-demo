package com.kuaidi100.sdk.response;

import lombok.Data;

import java.util.List;

/**
 * @description:
 * @author: ligl
 * @create: 2024-08-22 10:00
 **/
@Data
public class PriceQueryData {

    /**
     * 快递公司编码
     */
    private String kuaidicom;
    /**
     * 价格详情
     */
    private List<Combo> combos;


    @Data
    class Combo{
        /**
         * 价格
         */
        private Double price;
        /**
         * 产品名称
         */
        private String expType;
    }
}
