package com.kuaidi100.sdk.request;

import lombok.Getter;
import lombok.Setter;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2021-01-06 14:16
 */
@Getter
@Setter
public class ThirdAuthReq {
    /**
     * 请求的第三方平台，淘宝：taobao，菜鸟：cainiao，京东：jdalpha，拼多多：pinduoduoWx
     */
    private String net;
    /**
     * 授权完后的信息回调地址
     */
    private String callBackUrl;
    /**
     * 已经授权完需要重新获取授权信息
     */
    private String partnerId;
    /**
     * web(默认），wap(只有淘宝和菜鸟可以使用）
     */
    private String view;
}
