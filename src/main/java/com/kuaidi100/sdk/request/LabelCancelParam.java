package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2021-12-13 10:59
 */
@Data
public class LabelCancelParam {
    /**
     * 电子面单客户账户或月结账号，需贵司向当地快递公司网点申请
     */
    private String partnerId;
    /**
     * 电子面单密码，需贵司向当地快递公司网点申请
     */
    private String partnerKey;
    /**
     * 电子面单密钥，需贵司向当地快递公司网点申请； 是否必填该属性，请查看参数字典
     */
    private String partnerSecret;
    /**
     * 电子面单客户账户名称，需贵司向当地快递公司网点申请； 是否必填该属性，请查看参数字典
     */
    private String partnerName;
    /**
     * 收件网点名称,由快递公司当地网点分配，
     * 若使用淘宝授权填入（taobao），使用菜鸟授权填入（cainiao）
     */
    private String net;
    /**
     * 电子面单承载编号，需贵司向当地快递公司网点申请； 是否必填该属性，请查看参数字典
     */
    private String code;
    /**
     * 快递公司的编码，一律用小写字母
     */
    private String kuaidicom;
    /**
     * 快递单号
     */
    private String kuaidinum;
    /**
     * 快递公司订单号(对应下单时返回的kdComOrderNum，如果没有可以不传，否则必传)
     */
    private String orderId;
    /**
     * 取消原因
     */
    private String reason;
}
