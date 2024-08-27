package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @description:
 * @author: ligl
 * @create: 2024-08-26 15:59
 **/
@Data
public class PriceQueryParam  extends BaseRequest {

    /**
     * 快递公司编码
     */
    private String kuaidicom;
    /**
     * 寄件地址
     */
    private String sendAddr;
    /**
     * 收件地址
     */
    private String recAddr;
    /**
     * 重量，默认单位为kg，参数无需带单位，如1.0
     */
    private double weight;
}
