package com.kuaidi100.sdk.request.labelV2;

import com.kuaidi100.sdk.request.ManInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class InterceptOrderReq {

    /**
     * 订单id
     */
    private String orderId;
    /**
     * 快递公司编码
     */
    private String kuaidicom;
    /**
     * 订单id
     */
    private String kuaidinum;
    /**
     * 电子面单客户账户或月结账号，需贵司向当地快递公司网点申请（参考电子面单申请指南）； 是否必填该属性，请查看参数字典
     */
    private String partnerId;
    /**
     * 电子面单密码，需贵司向当地快递公司网点申请； 是否必填该属性，请查看参数字典
     */
    private String partnerKey;
    /**
     * 电子面单密钥，需贵司向当地快递公司网点申请； 是否必填该属性，请查看参数字典
     */
    private String partnerSecret;
    /**
     * 电子面单账号，
     */
    private String partnerName;
    /**
     * 电子面单承载编号，需贵司向当地快递公司网点申请； 是否必填该属性，请查看参数字典
     */
    private String code;
    /**
     * 收件网点名称,由快递公司当地网点分配， 若使用淘宝授权填入（taobao），使用菜鸟授权填入（cainiao), 使用京东授权填入（jdalpha),使用拼多多授权填入(pinduoduoWx)。 是否必填该属性，请查看参数字典 （若通过第三方授权方式获取单号partnerId,partnerKey参数为必填,参数值可通过第三方授权接口获取)
     */
    private String net;
    /**
     * 拦截原因
     */
    private String reason;
    /**
     * 拦截类型
     * RETURN_SEND_STATION  退回寄件网点
     * RETURN_SEND_ADDR  退回寄件地址
     * MODIFY_ADDR 修改地址
     */
    private String interceptType;
    /**
     * 收件人地址
     */
    private ManInfo recManInfo;

    /**
     * 发起方1 寄方 2收方3 第三方
     */
    private String orderRole;
    /**
     * 付款方式
     * SHIPPER 寄付
     * CONSIGNEE 到付
     * THIRDPARTY 第三方月结
     * MONTHLY 寄付月结
     */
    private String interceptPayType;
    /**
     * 回调加密参数
     */
    private String salt;
    /**
     * 拦截结果回调地址
     */
    private String callbackUrl;
    /**
     * 中通服务商拦截模式需要传入appKey
     */
    private String appKey;
    /**
     * 中通服务商拦截模式需要传入appSecret
     */
    private String appSecret;
}
