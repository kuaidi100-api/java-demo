package com.kuaidi100.sdk.request.internationalshipment;

import lombok.Data;

/**
 * 支付
 *
 * @Author: ligl
 * @Date: 2021-07-30 10:25
 */
@Data
public class Payment {
    /**
     * 运费支付方式(支付方式:SHIPPER-寄方付;CONSIGNEE-收方付 默认SHIPPER)
     * 关税(支付方式:DDU-寄方支付;DDP-收方支付;默认DDP)
     */
    private String paymentType;
    /**
     * 账号
     */
    private String account;
}
