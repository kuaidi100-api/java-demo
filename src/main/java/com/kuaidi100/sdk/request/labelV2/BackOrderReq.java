package com.kuaidi100.sdk.request.labelV2;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @description: 运单附件查询请求类
 * @author: api.kuaidi100.com
 * @date: 2024/4/28
 * @version: 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BackOrderReq {
    /**
     * 快递公司编码
     */
    private String kuaidicom;

    /**
     * 快递单号
     */
    private String kuaidinum;

    /**
     * 快递100附件类型，默认1。1：回单
     */
    private Integer imgType = 1;

    /**
     * 电子面单客户账户或月结账号
     */
    private String partnerId;

    /**
     * 电子面单密码
     */
    private String partnerKey;

    /**
     * 寄件人手机号。顺丰、德邦必填
     */
    private String phone;

}
