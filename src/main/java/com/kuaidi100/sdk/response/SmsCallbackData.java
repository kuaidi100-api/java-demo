package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-21 10:05
 */
@Data
public class SmsCallbackData {
    /**
     * 传入的外部订单号
     */
    private String outorder;
    /**
     * 附加信息
     */
    private String message;
    /**
     * 短信发送状态：发送成功、发送失败、接收成功、接收失败
     */
    private String status;
    /**
     * 返回校验信息：MD5(id + phone + outorder)；校验方式是MD5加密的：模板ID+手机号+外部订单号。用户可根据加密签名判断是否进行处理请求
     */
    private String sign;
}
