package com.kuaidi100.sdk.request.ThirdPlatform;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-02-17 15:55
 */
@Data
public class UploadNumReq {
    /**
     * 店铺类型，TAOBAO：淘宝，JINGDONG：京东，TOUTIAO：抖店，PINDUODUO：拼多多
     */
    private String shopType;
    /**
     * 店铺ID
     */
    private String shopId;
    /**
     * 订单号，需要填写正确，否则会被电商平台的风控系统拦截
     */
    private String orderNum;
    /**
     * 快递公司编码，需要填写正确，否则会被电商平台的风控系统拦截，编码请查看参数字典
     */
    private String kuaidiCom;
    /**
     * 快递单号，需要填写正确，否则会被电商平台的风控系统拦截
     */
    private String kuaidiNum;

}
