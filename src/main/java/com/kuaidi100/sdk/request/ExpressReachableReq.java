package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-11-04 10:35
 */
@Data
public class ExpressReachableReq {
    /**
     * 收件人姓名
     */
    private String recManName;
    /**
     * 收件人的手机号
     */
    private String recManMobile;
    /**
     * 收件人所在完整地址，如广东深圳市深圳市南山区科技南十二路2号金蝶软件园
     */
    private String recManPrintAddr;
    /**
     * 寄件人姓名
     */
    private String sendManName;
    /**
     * 寄件人的手机号
     */
    private String sendManMobile;
    /**
     * 寄件人所在完整地址，如广东深圳市深圳市南山区科技南十二路2号金蝶软件园
     */
    private String sendManPrintAddr;
    /**
     * 快递公司编码，如yuantong，shunfeng，一次仅支持传入一家快递公司，支持的快递公司及编码见本文档1.8 支持快递公司列表
     */
    private String kuaidicom;


}
