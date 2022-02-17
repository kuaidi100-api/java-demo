package com.kuaidi100.sdk.request.ThirdPlatform;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-02-17 15:34
 */
@Data
public class StoreAuthReq {
    /**
     * 店铺类型，TAOBAO：淘宝，JINGDONG：京东，TOUTIAO：抖店，PINDUODUO：拼多多
     */
    private String shopType;
    /**
     * 回调地址，默认仅支持http
     */
    private String callbackUrl;
    /**
     * 回调参数sign的加密参数，非空时回调才会有sign参数
     */
    private String salt;
}
