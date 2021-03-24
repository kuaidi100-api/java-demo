package com.kuaidi100.sdk.request.samecity;

import lombok.Data;

import java.util.List;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 17:25
 */
@Data
public class OrderReq {
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
     * 服务类型
     */
    private String serviceType;
    /**
     * 物品总重量KG，例：1.5，单位kg
     */
    private Double weight;
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
    private String callbackUrl;
    /**
     * 订单类型，默认为0 0: 立即单  1: 预约单
     */
    private Integer orderType;
    /**
     * 取货时间（2020-02-02 22:00,指的是预约取件时间）
     */

    private String pickupTime;
    /**
     * 支付方式，SHIPPER: 寄付（默认），CONSIGNEE: 到付
     */
    private String payment;
    /**
     * 对应商家版物品来源流水号
     */
    private String orderSourceNo;
    /**
     * 物品来源
     */
    private String orderSourceType;
    /**
     * 店铺ID
     */
    private String storeId;
    /**
     * 小费（分）
     */
    private Integer additionFee;
    /**
     * 保险费用(闪送支持)
     */
    private Integer insurance;
    /**
     * 保险产品ID(闪送支持)
     */
    private String insuranceProId;
    /**
     * 商品价格
     */
    private Integer price;
    /**
     * 代收价格
     */
    private Integer CollectionPrice;

    private String partnerId;

    private String partnerKey;

    /**
     * 商品详情（强烈建议提供，方便骑手在取货时确认货品信息 ；顺丰时必填）
     */
    private List<OrderGoods> goods;
}
