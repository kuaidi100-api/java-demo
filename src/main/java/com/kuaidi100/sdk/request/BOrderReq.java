package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-09-17 14:33
 */
@Data
public class BOrderReq {

    /**
     * 快递公司的编码，一律用小写字母，见《快递公司编码》
     */
    private  String kuaidicom;
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
     * 快递业务服务类型，例：标准快递，默认为标准快递
     */
    private String serviceType;
    /**
     * 预约日期，例如：今天/明天/后天
     */
    private String dayType;
    /**
     * 预约起始时间（HH:mm），例如：09:00，顺丰必填
     */
    private String pickupStartTime;
    /**
     * 预约截止时间（HH:mm），例如：10:00，顺丰必填
     */
    private String pickupEndTime;
    /**
     * 保价额度，单位：元
     */
    private String valinsPay;
    /**
     * 是否口令签收，Y：需要 N: 不需要，默认值为N（德邦快递专属参数）
     */
    private String passwordSigning;
    /**
     * 是否开启订阅功能 0：不开启(默认) 1：开启 说明开启订阅功能时：pollCallBackUrl必须填入 此功能只针对有快递单号的单
     */
    private String op;
    /**
     * 如果op设置为1时，pollCallBackUrl必须填入，用于跟踪回调
     */
    private String pollCallBackUrl;
    /**
     * 添加此字段表示开通行政区域解析或地图轨迹功能 。
     * 0：关闭（默认）
     * 1：开通行政区域解析功能(详见：快递信息推送接口文档-2.3 推送输入参数),
     * 3：开通地图轨迹及时效返回（回调报文参考地图轨迹推送服务技术文档-推送接口）
     */
    private String resultv2;
    /**
     * 面单返回类型，默认为空，不返回面单内容。10：设备打印，20：图片回调。
     */
    private String returnType;
    /**
     * 设备码，returnType为10时必填
     */
    private String siid;
    /**
     * 模板编码，通过管理后台的电子面单模板信息获取 ，returnType不为空时必填
     */
    private String tempid;
    /**
     * 打印状态回调地址，returnType为10时必填
     */
    private String printCallBackUrl;

    //平台订单号，最大32位。若此参数与之前的重复，48小时内返回第一次下单内容，否则会重新下单
    private String thirdOrderId;

    //取件码自定义传入，需传入4位数字，仅用于极兔，其他快递公司传入无效
    private String pickupCode;

    //寄件人实名信息（圆通、极兔支持 ）
    private String realName;

    //寄件人证件类型，1：居民身份证 ；2：港澳居民来往内地通行证 ；3：台湾居民来往大陆通行证 ；4：中国公民护照（圆通、极兔支持 ）
    private String sendIdCardType;

    //寄件人证件号码 （圆通、极兔支持 ）
    private String sendIdCard;

    //渠道ID，如有多个同品牌运力，请联系商务提供后传入
    private String channelSw;

    //支付方式，SHIPPER: 寄付（默认）。不支持到付
    private String payment;
}
