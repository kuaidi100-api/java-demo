package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-04-26 15:56
 */

@Data
public class ThirdPlatformRestReq {
    /**
     * 调用第三方授权接口后获取到的partnerId值
     */
    private String partnerId;
    /**
     * 调用第三方授权接口后获取到的partnerKey值
     */
    private String partnerKey;
    /**
     * 菜鸟:cainiao，淘宝:taobao，京东无界:jdalpha，拼多多:pinduoduoWx，抖店:douyin
     */
    private String net;
    /**
     * 快递公司编号
     */
    private String com;
}
