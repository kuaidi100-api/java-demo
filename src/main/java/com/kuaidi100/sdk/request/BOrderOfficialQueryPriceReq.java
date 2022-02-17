package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * 商家寄件(官方快递)
 *
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 15:29
 */
@Data
public class BOrderOfficialQueryPriceReq {
    /**
     * 快递公司编码
     */
    private String kuaidiCom;
    /**
     * 出发地地址，最小颗粒到市级，例如：广东省深圳市
     */
    private String address;

    private String sendManPrintAddr;

    private String recManPrintAddr;
}
