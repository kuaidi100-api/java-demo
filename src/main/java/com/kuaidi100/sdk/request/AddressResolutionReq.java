package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @description:
 * @author: api.kuaidi100.com
 * @date: 2024/5/21
 * @version: 1.0.0
 */
@Data
public class AddressResolutionReq extends BaseRequest  {
    /**
     * 快递100分配给贵司的的授权key
     */
    private String key;
    /**
     * 加密签名信息：MD5(param+t+key+secret)；加密后字符串转大写
     */
    private String sign;
    /**
     * 当前请求时间戳
     */
    private String t;
    /**
     * 其他参数
     */
    private String param;

}
