package com.kuaidi100.sdk.request.corder;

import lombok.Data;

/**
 *
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 15:29
 */
@Data
public class COrderQueryPriceReq {
    /**
     * 快递公司编码
     */
    private String kuaidicom;
    /**
     * 出发地地址，最小颗粒到市级，例如：广东省深圳市
     */
    private String sendManPrintAddr;
    /**
     * 目的地地址，最小颗粒到市级，例如：广东省深圳市
     */
    private String recManPrintAddr;
    /**
     * 重量
     */
    private String weight;
    /**
     * 业务类型
     */
    private String serviceType;
}
