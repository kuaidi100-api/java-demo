package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-21 9:14
 */
@Data
public class SendSmsReq extends BaseRequest {
    /**
     * 加密签名信息：MD5(key + userid)；加密后字符串转大写
     */
    private String sign;
    /**
     * 我方分配给贵司的的短信接口用户ID，点击查看账号信息
     */
    private String userid;
    /**
     * 商户名称签名；最好用简称，该字段信息会在短信标签处显示。不要超过5个字符
     */
    private String seller;
    /**
     * 接收短信手机号
     */
    private String phone;
    /**
     * 短信模板ID
     */
    private String tid;
    /**
     * 短信模板替换内容
     */
    private String content;
    /**
     * 外部订单号：当该短信发送模板有回调地址时，外部订单号会返回给调用者，方便用户更新数据
     */
    private String outorder;
    /**
     * 回调地址：如果客户在发送短信时填写该参数，将按照这个参数回调短信发送状态；
     * 如果为空，将按照模板配置的地址回调短信发送状态；如果两个参数都不填写，将不会回调通知状态
     */
    private String callback;
}
