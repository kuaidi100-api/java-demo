package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-12-13 13:37
 */
@Data
public class CloudPrintCommandParam {
    /**
     * 可识别打印指令，内容需我司硬件指令进行协商确定
     */
    private String content;
    /**
     * 打印设备，通过打印机输出的设备码进行获取
     */
    private String siid;
    /**
     * 签名用随机字符串
     */
    private String salt;
    /**
     * 打印状态回调地址
     */
    private String callBackUrl;

}
