package com.kuaidi100.sdk.request.samecity;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 16:57
 */
@Data
public class AuthReq {
    /**
     * 快递公司，一律用小写字母，见参数字典
     */
    private String com;
    /**
     * 授权店铺id
     */
    private String storeId;
    /**
     * 授权后信息的信息回调地址
     */
    private String callbackUrl;
}
