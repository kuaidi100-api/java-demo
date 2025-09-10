package com.kuaidi100.sdk.request.labelV2;

import com.kuaidi100.sdk.contant.PrintType;
import com.kuaidi100.sdk.request.ManInfo;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * @Author: ligl
 * @Date: 2022-04-28 17:40
 */
@Data
public class OrderReq {
    /**
     * 收件人信息
     */
    private ManInfo recMan;
    /**
     * 寄件人信息
     */
    private ManInfo sendMan;
    /**
     * 快递公司编码
     */
    private String kuaidicom;
    /**
     * 快递公司单号
     */
    private String kuaidinum;
    /**
     * 订单号
     */
    private String orderId;
    /**
     * SHIPPER:寄方付 CONSIGNEE:到付 MONTHLY:月结 THIRDPARTY:第三方支付
     */
    private String payType = "MONTHLY";
    /**
     * 快递类型: 标准快递 顺丰特惠 电商特惠 EMS经济
     */
    private String expType;
    /**
     * 重量
     */
    private double weight;
    /**
     * 体积（长*宽*高）
     */
    private String volume;
    /**
     * 物品总数量
     */
    private int count =1;
    /**
     * 备注
     */
    private String remark;
    /**
     * 保价额度
     */
    private double valinsPay;
    /**
     * 代收货款
     */
    private double collection;
    /**
     * 物品名称,例：文件
     */
    private String cargo;
    /**
     * 是否需要子单： 1：需要 0：不需要(默认) 如果需要子单（指同一个订单打印出多张电子面单，即同一个订单返回多个面单号）； needChild = 1、count 需要大于1，如count = 2 一个主单 一个子单，count = 3 一个主单 二个子单，返回的子单号码见返回结果的childNum字段
     */
    private String needChild;
    /**
     * 是否需要回单： 1：需要 0：不需要(默认) 返回的回单号见返回结果的returnNum字段
     */
    private String needBack;
    /**
     * 电子面单客户账户或月结账号
     */
    private String partnerId;
    /**
     * 电子面单密码
     */
    private String partnerKey;
    /**
     * 电子面单密钥
     */
    private String net;
    /**
     * 电子面单承载编号
     */
    private String code;
    /**
     * 电子面单客户账户名称
     */
    private String partnerName;
    /**
     * 电子面单承载快递员名
     */
    private String checkMan;
    /**
     * 电子面单密钥，需贵司向当地快递公司网点申请
     */
    private String partnerSecret;
    /**
     * 在使用菜鸟/淘宝/拼多多授权电子面单时，若月结账号下存在多个网点，则tbNet="网点名称,网点编号" ，注意此处为英文逗号
     */
    private String tbNet;
    /**
     * 邮费
     */
    private double freight;
    /**
     * 京东增值服务用
     */
    private String expressExtra;
    /**
     * 增值服务 {"backnum":{"value":"无需返单"}}
     */
    private String addService;
    /**
     * 订单类型;京东订单-JINGDONG;淘宝订单-TAOBAOSENT
     */
    private String recordType;
    /**
     * 预约取件开始时间
     */
    private Long startGotTime;
    /**
     * 预约取件结束时间
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
     * 顺丰电子验收图片熟悉数量
     */
    private Integer elecPicCount;
    /**
     * 顺丰手持设备扫描设置
     */
    private int scanSupport;
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
    private Integer isOut = 0;
    /**
     * 是否合伙人自提:1-是,0-否
     */
    private Integer isPickupSelf = 0;
    /**
     * 是否接受仅镇中心派送:1-是,0-否
     */
    private Integer isCenterDelivery = 0;
    /**
     * 第三方平台订单号
     */
    private String thirdOrderId;
    /**
     * 开放地址ID 淘宝订单收件人ID (Open Addressee ID)，长度不超过128个字符，淘宝订单加密情况用于解密。
     */
    private String oaid;
    /**
     * 菜鸟地址ID，针对电商平台加密订单场景使用，淘系订单使用oaid，非淘使用caid。
     */
    private String caid;

    /**
     * normal-常规的字母单,multi-一票多件
     */
    private String childNumType = "normal";
    /**
     *回单数量
     */
    private Integer backSign;
    /**
     * 第三方平台模板url
     */
    private String thirdTemplateURL;
    /**
     * 京东快运站点揽收字段
     */
    private Integer siteCollect;
    /**
     * 京东快运站点派送字段
     */
    private Integer siteDelivery;
    /**
     * 回单号
     */
    private String returnNum;
    /**
     * 车辆类型名称（京东快运整车需要）
     */
    private String vehicleTypeName;
    /**
     * 车辆类型编码（京东快运整车需要）
     */
    private String vehicleTypeNo;
    /**
     * 整车单号（京东快运整车需要）
     */
    private String vehicleOrderNo;
    /**
     * 自定义参数，优先级高于系统生成值，即出现相同key时，使用该参数的value
     */
    private Map<String,Object> customParam;
    /**
     * 打印方向（默认0） 0-正方向 1-反方向
     */
    private String direction;
    /**
     * 打印设备，通过打印机输出的设备码进行获取
     */
    private String siid;
    /**
     * 打印状态回调地址
     */
    private String callBackUrl;
    /**
     * 签名用随机字符串，用于验证签名sign。salt值不为null时，推送数据将包含该加密签名，加密方式：md5(param+salt)。注意： salt值为空串时，推送的数据也会包含sign，此时可忽略sign的校验。
     */
    private String salt;
    /**
     * 是否开启订阅功能 false：不开启(默认) true：开启 说明开启订阅功能时：pollCallBackUrl必须填入 此功能只针对有快递单号的单
     */
    private boolean needSubscribe;
    /**
     * 如果op设置为1时，pollCallBackUrl必须填入，用于跟踪回调
     */
    private String pollCallBackUrl;
    /**
     * 添加此字段表示开通行政区域解析或地图轨迹功能 。
     * 0：关闭（默认）
     * 1：开通行政区域解析功能
     * 3：开通地图轨迹及时效返回
     */
    private String resultv2;
    /**
     * 快递100模板url
     */
//    @NotBlank(message = "快递100模板编码不能为空:tempId")
    private String tempId;
    /**
     * 快递100子单模板url()
     */
    private String childTempId;
    /**
     * 快递100回单模板url
     */
    private String backTempId;
    /**
     * 是否脱敏 false：关闭（默认）true：开启
     */
    private boolean needDesensitization;
    /**
     * 是否需要logo false：关闭（默认）true：开启
     */
    private boolean needLogo;
    /**
     * 打印类型（HTML,IMAGE,CMD,CLOUD,NON）
     * NON:只下单不打印（默认）
     * HTML:生成html短链
     * IMAGE:生成图片短链
     * CMD:生成打印指令
     * CLOUD:使用快递100云打印机打印，使用CLOUD时siid必填
     */
    private PrintType printType = PrintType.NON;

    /**
     * 第三方平台订单是否需要ocr，开启后将会通过推送方式推送 false：关闭（默认）true：开启
     */
    private boolean needOcr;

    /**
     * 需要检测识别的面单元素。取值范围：barcode,qrcode,receiver,sender,bulkpen。不传或者 null 则默认为 ["barcode", "receiver", "sender"]
     */
    private List<String> ocrInclude;

    private String height;

    private String width;
    /**
     * 第三方平台自定义区域模板地址
     */
    private String thirdCustomTemplateUrl;
    /**
     * 接口版本
     */
    private int billVersion;

    /**
     * 新增字段，箱码字段。第一个为母单箱码，其他为子单箱码。
     */
    private List<String> boxNo;

    /**
     * 取件联系人姓名
     */
    private String consignorName;

    /**
     * 取件联系人电话
     */
    private String consignorMobile;
}
