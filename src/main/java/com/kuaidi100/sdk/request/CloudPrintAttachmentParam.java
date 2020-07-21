package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-20 9:37
 */
@Data
public class CloudPrintAttachmentParam {
    /**
     * 贵司内部自定义的订单编号,需要保证唯一性，非必填
     */
    private String orderId;
    /**
     * 打印纸的高度，以mm为单位
     */
    private String height;
    /**
     * 打印纸的宽度，以mm为单位
     */
    private String width;
    /**
     * 需要打印的份数，默认是一份
     */
    private String copyNum;
    /**
     * 打印范围，起始页，仅对多页文件支持，默认是打印整个文档
     */
    private String  startPage;
    /**
     * 打印范围，结束页，仅对多页文件支持，默认是打印整个文档
     */
    private String endPage;
    /**
     * 签名用随机字符串
     */
    private String salt;
    /**
     * 打印设备，通过打印机输出的设备码进行获取
     */
    private String siid;
    /**
     * 打印状态回调地址
     */
    private String callBackUrl;
}
