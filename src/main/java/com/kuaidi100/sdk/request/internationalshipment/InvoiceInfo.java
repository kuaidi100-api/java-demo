package com.kuaidi100.sdk.request.internationalshipment;

import lombok.Data;

/**
 * 发票信息
 *
 * @Author: ligl
 * @Date: 2021-08-03 10:58
 */
@Data
public class InvoiceInfo {
    /**
     * 发票日期（格式：yyyy-MM-dd）
     */
    private String date;
    /**
     * 发票号
     */
    private String number;
    /**
     * 发票类型
     */
    private String type;
    /**
     * 发票抬头,base64字符或常规字符,不同快递公司要求不一样
     */
    private String title;

    /**
     * 发票签名（BASE64字符串）
     */
    private String signature;
    /**
     * 是否启用无纸化贸易
     */
    private Boolean pltEnable;
}
