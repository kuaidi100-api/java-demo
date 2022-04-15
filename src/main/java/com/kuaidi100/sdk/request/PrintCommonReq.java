package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-03-25 9:42
 */
@Data
public class PrintCommonReq {

    /**
     * 业务类型，默认为10
     */
    private String type;
    /**
     * 电子面单客户账户或月结账号，需贵司向当地快递公司网点申请
     */
    private String partnerId;
    /**
     * 电子面单密码，需贵司向当地快递公司网点申请
     */
    private String partnerKey;
    /**
     * 收件网点名称,由快递公司当地网点分配，
     * 若使用淘宝授权填入（taobao），使用菜鸟授权填入（cainiao）
     */
    private String net;
    /**
     * 在使用菜鸟/淘宝/拼多多授权电子面单时，若月结账号下存在多个网点，则tbNet="网点名称,网点编号" ，注意此处为英文逗号
     */
    private String tbNet;
    /**
     * 快递公司的编码，一律用小写字母
     */
    private String kuaidicom;
    /**
     * 快递公司单号
     */
    private String kuaidinum;
    /**
     * 收件人信息
     */
    private ManInfo recMan;
    /**
     * 收件人信息
     */
    private ManInfo sendMan;
    /**
     * 	物品名称(部分快递公司必填)
     */
    private String cargo;
    /**
     * 物品总数量。
     * 另外该属性与子单有关，如果需要子单（指同一个订单打印出多张电子面单，即同一个订单返回多个面单号），
     * needChild = 1、count 需要大于1，如count = 2 则一个主单 一个子单，
     * count = 3则一个主单 二个子单；返回的子单号码见返回结果的childNum字段
     */
    private String count;
    /**
     * 物品总重量，单位：KG （例子：0.5）
     */
    private String weight;
    /**
     * 支付方式：
     * SHIPPER:寄方付（默认）
     * CONSIGNEE:到付
     * MONTHLY:月结
     * THIRDPARTY:第三方支付
     */
    private String payType;
    /**
     * 快递类型：
     * 标准快递（默认）
     * 顺丰特惠
     * EMS经济
     */
    private String expType;
    /**
     * 备注
     */
    private String remark;
    /**
     * 保价额度
     */
    private String valinsPay;
    /**
     * 代收货款额度
     */
    private String collection;
    /**
     * 是否需要子单(支持子单的快递公司才可以用，是否支持可以参考参数字典)
     * 1:需要
     * 0:不需要(默认)
     * 如果需要子单（指同一个订单打印出多张电子面单，即同一个订单返回多个面单号）；
     * needChild = 1、count 需要大于1，如count = 2 一个主单 一个子单，
     * count = 3 一个主单 二个子单，返回的子单号码见返回结果的childNum字段
     */
    private String needChild;
    /**
     * 是否需要回单(支持回单的快递公司才可以用，是否支持可以参考参数字典)
     * 1:需要
     * 0:不需要(默认)
     * 返回的回单号见返回结果的returnNum字段
     */
    private String needBack;
    /**
     * 贵司内部自定义的订单编号,需要保证唯一性
     */
    private String orderId;
    /**
     * 签名用随机字符串
     */
    private String salt;
    /**
     * 是否开启订阅功能：
     * 0：不开启(默认)
     * 1：开启
     * 说明开启订阅功能时：pollCallBackUrl必须填入
     * 此功能只针对有快递单号的单
     */
    private String op;
    /**
     * 如果op设置为1时，pollCallBackUrl必须填入，用于跟踪回调
     */
    private String pollCallBackUrl;
    /**
     * 添加此字段表示开通行政区域解析功能：0：关闭（默认）；1：开通行政区域解析功能
     */
    private String resultv2;
    /**
     * 扩展字段，不同快递公司具体详情看参数字典
     * https://api.kuaidi100.com/help/doc/?code=5f0ff6e82977d50a94e10237&openKey=%E7%94%B5%E5%AD%90%E9%9D%A2%E5%8D%95
     */
    private String code;
    /**
     * 扩展字段，具体详情看参数字典
     * https://api.kuaidi100.com/help/doc/?code=5f0ff6e82977d50a94e10237&openKey=%E7%94%B5%E5%AD%90%E9%9D%A2%E5%8D%95
     */
    private String partnerSecret;
    /**
     * 扩展字段，具体详情看参数字典
     * https://api.kuaidi100.com/help/doc/?code=5f0ff6e82977d50a94e10237&openKey=%E7%94%B5%E5%AD%90%E9%9D%A2%E5%8D%95
     */
    private String partnerName;
    /**
     * 扩展字段，具体详情看参数字典
     * https://api.kuaidi100.com/help/doc/?code=5f0ff6e82977d50a94e10237&openKey=%E7%94%B5%E5%AD%90%E9%9D%A2%E5%8D%95
     */
    private String checkMan;
    /**
     * 第三方平台面单基础模板链接，如为第三方平台导入订单选填，如不填写，默认返回两联面单模板
     */
    private String thirdTemplateURL;
    /**
     * 淘宝订单收件人ID (Open Addressee ID)，长度不超过128个字符，淘宝订单加密情况用于解密
     */
    private String oaid;
    /**
     * 平台导入返回的订单id：如平台类加密订单，使用此下单为必填
     */
    private String thirdOrderId;
    /**
     * 第三方平台明文订单直连平台面单模板生成电子面单，
     * 默认值为空，如为第三方明文订单，需设置为1才可以按照thirdTemplateURL对应模板返回，否则按照tempid对应模板返回
     */
    private String thirdPrint;
    /**
     * 打印时间
     */
    private String printTime;
    /**
     * 额外服务（类似部分物流公司的需定义派送方式，包装等）
     */
    private String addService;
    /*
     *  到付金额（单位：元）
     */
    private String freight;
    /**
     * 订单类型;京东订单-JINGDONG;淘宝订单-TAOBAOSENT
     */
    private String recordType;
    /**
     * 取件时间
     */
    private Long startGotTime;
    /**
     * 最晚取件时间
     */
    private Long endGotTime;
    /**
     * 代收账户
     */
    private String colAcctNumber;
    /**
     * 代收账户名
     */
    private String colAcctName;
    /**
     * 顺丰电子验收
     */
    private Integer elecValidateType;
    /**
     * 顺丰电子验收图片数量
     */
    private Integer elecPicCount;
    /**
     * 手持设备扫描设置
     */
    private Integer scanSupport;
    /**
     * 文件url
     */
    private String fileUrl;
    /**
     * 取件方式
     */
    private String pickMethod;
    /**
     * 是否外发,1-外发,0不外发
     */
    private Integer isOut;
    /**
     * 是否合伙人自提:1-是,0-否
     */
    private Integer isPickupSelf;
    /**
     * 是否接受仅镇中心派送:1-是,0-否
     */
    private Integer isCenterDelivery;
    /**
     * normal-常规的字母单,multi-一票多件
     */
    private String childNumType;
    /**
     *回单数量
     */
    private Integer backSign;

    /**
     * 站点揽收
     */
    private Integer siteCollect;
    /**
     * 站点派送
     */
    private Integer siteDelivery;
    /**
     * 回单号
     */
    private String returnNum;
    /**
     * 车辆类型名称
     */
    private String vehicleTypeName;
    /**
     * 车辆类型编码
     */
    private String vehicleTypeNo;
    /**
     * 整车单号
     */
    private String vehicleOrderNo;
    /**
     * 生成图片的宽，以mm为单位，例如：100
     */
    private String width;
    /**
     * 生成图片的高，以mm为单位，例如：180
     */
    private String height;
}
