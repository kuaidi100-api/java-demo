package com.kuaidi100.sdk.request.cloud;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-10-27 15:47
 */
@Data
public class COrderReq extends CloudBaseReq{
    /**
     * 快递公司的编码，一律用小写字母，见《快递公司编码》
     */
    private  String com;
    /**
     * 收件人姓名
     */
    private String recManName;
    /**
     * 收件人的手机号，手机号和电话号二者其一必填
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
     * 寄件人的手机号，手机号和电话号二者其一必填
     */
    private String sendManMobile;
    /**
     * 寄件人所在的完整地址，如广东深圳市深圳市南山区科技南十二路2号金蝶软件园B10
     */
    private String sendManPrintAddr;
    /**
     * 物品名称,例：文件
     */
    private String cargo;
    /**
     * 物品总重量KG，例：1.5，单位kg
     */
    private String weight;
    /**
     * 备注
     */
    private String remark;
    /**
     * 签名用随机字符串
     */
    private String salt;
    /**
     * callBackUrl订单信息回调
     */
    private String callBackUrl;
    /**
     * 预约日期，例如：今天/明天/后天
     */
    private String dayType;
    /**
     * 预约起始时间（HH:mm），例如：09:00
     */
    private String pickupStartTime;
    /**
     * 预约截止时间（HH:mm），例如：10:00
     */
    private String pickupEndTime;
    /**
     * 支付方式，SHIPPER: 寄付（默认），CONSIGNEE: 到付
     */
    private String payment;
}
