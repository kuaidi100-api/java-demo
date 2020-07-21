package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-20 9:38
 */
@Data
public class CloudPrintCustomParam {
    /**
     * 贵司内部自定义的订单编号,需要保证唯一性，非必填
     */
    private String orderId;
    /**
     * 通过管理后台的打印摸版配置信息获取
     */
    private String tempid;
    /**
     * 打印设备，通过打印机输出的设备码进行获取
     */
    private String siid;
    /**
     * 打印纸的高度
     */
    private String height;
    /**
     * 打印纸的宽度
     */
    private String width;
    /**
     * 打印状态回调地址
     */
    private String callBackUrl;
    /**
     * 签名用随机字符串
     */
    private String salt;
}
