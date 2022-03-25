package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 15:49
 */
@Data
public class PrintImgParam extends PrintCommonReq{
    /**
     * 收件人姓名
     */
    private String recManName;
    /**
     * 收件人的手机号
     */
    private String recManMobile;
    /**
     * 收件人的手机号
     */
    private String recManTel;
    /**
     * 收件人所在完整地址
     */
    private String recManPrintAddr;
    /**
     * 收件人所在公司名称
     */
    private String recManCompany;
    /**
     * 寄件人姓名
     */
    private String sendManName;
    /**
     * 寄件人的手机号
     */
    private String sendManMobile;
    /**
     * 寄件人的手机号
     */
    private String sendManTel;
    /**
     * 寄件人所在的完整地址
     */
    private String sendManPrintAddr;
    /**
     * 寄件人所在公司名称
     */
    private String sendManCompany;
    /**
     * 打印电子面单模板编码（登录快递100管理后台查看）
     */
    private String tempid;
    /**
     * 是否开启异步对推送图片，默认：0（不开启），1（开启），目前只针对第三方加密组件异步推送面单图片
     */
    private String asyn;
    /**
     * 开启异步推送时，需要提交的接收图片内容接口
     */
    private String callBackUrl;

}
