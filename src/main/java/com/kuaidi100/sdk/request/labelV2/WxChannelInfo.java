package com.kuaidi100.sdk.request.labelV2;

import lombok.Data;

@Data
public class WxChannelInfo {

    /**
     * 微信跨店铺需要的数据
     * =====================================================
     * 电子面单跨店铺取号的订单秘钥
     */
    private String orderCode;

    /**
     * 电子面单跨店铺取号的订单所属店铺appid
     */
    private String orderAppId;
    /*=====================================================*/
}
