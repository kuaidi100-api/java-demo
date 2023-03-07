package com.kuaidi100.sdk.request.bsamecity;

import lombok.Data;

import java.util.List;

/**
 * @description : 同城寄件-下单请求类
 * @author: api.kuaidi100.com
 * @date: 2023/3/7
 * @version:
 */
@Data
public class BsamecityOrderReq {
    /**
     * 快递公司的编码，一律用小写字母，见《快递公司编码》
     */
    private String kuaidicom;
    /**
     * 坐标类型(1：百度坐标，2：高德坐标 ,默认2)
     */
    private int lbsType;
    /**
     * 收件人姓名，长度最大20
     */
    private String recManName;
    /**
     * 收件人的手机号（有手机号和固话正则校验）
     */
    private String recManMobile;
    /**
     * 收件人所在的省，长度最大20
     */
    private String recManProvince;
    /**
     * 收件人所在的市，长度最大20
     */
    private String recManCity;
    /**
     * 收件人所在的区，长度最大20
     */
    private String recManDistrict;
    /**
     * 收件人所在的完整地址，如 科技南十二路2号金蝶软件园B10，长度最大100
     */
    private String recManAddr;
    /**
     * 收件人地址纬度，默认高德坐标，长度最大10
     */
    private String recManLat;
    /**
     * 收件人地址经度，默认高德坐标，长度最大10
     */
    private String recManLng;
    /**
     * 寄件人姓名，长度最大20
     */
    private String sendManName;
    /**
     * 寄件人的手机号（有手机号和固话正则校验）
     */
    private String sendManMobile;
    /**
     * 寄件人所在的省，长度最大20
     */
    private String sendManProvince;
    /**
     * 寄件人所在的市，长度最大20
     */
    private String sendManCity;
    /**
     * 寄件人所在的区，长度最大20
     */
    private String sendManDistrict;
    /**
     * 寄件人所在的完整地址，如 科技南十二路2号金蝶软件园B10，长度最大100
     */
    private String sendManAddr;
    /**
     * 寄件人地址纬度，默认高德坐标，长度最大10
     */
    private String sendManLat;
    /**
     * 寄件人地址经度，默认高德坐标，长度最大10
     */
    private String sendManLng;
    /**
     * 物品总重量KG，例：1.5，单位kg
     */
    private String weight;
    /**
     * 备注,例：测试寄件，长度最多255
     */
    private String remark;
    /**
     * 体积cm3，长度最多20
     */
    private String volume;
    /**
     * 0：无需预约 1：预约单送达时间 2：预约单上门时间 默认为0
     */
    private int orderType;
    /**
     * 取货时间，orderType=2时必填，例子：2020-02-02 22:00
     */
    private String expectPickupTime;
    /**
     * 期望送达时间，orderType=1时必填（例子：2020-02-02 22:00）
     */
    private String expectFinishTime;
    /**
     * 保价物品金额
     */
    private String insurance;
    /**
     * 物品总金额，例：100.23
     */
    private String price;
    /**
     * 是否为专人直送订单，0为否，1为是
     */
    private int directDelivery;
    /**
     * 商品详情
     */
    private List<Goods> goods;
    /**
     * 下单结果回调地址
     */
    private String callbackUrl;
    /**
     *  签名用随机字符串，长度最多20
     */
    private String salt;

}
