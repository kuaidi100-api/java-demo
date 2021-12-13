package com.kuaidi100.sdk.request.internationalshipment;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class ShipmentReq {
    /**
     * 收件人信息
     */
    private ManInfo recMan;
    /**
     * 寄件人信息
     */
    private  ManInfo sendMan;
    /**
     * 快递公司的编码，一律用小写字母，见参数字典）
     */
    private String kuaidicom;
    /**
     * 产品类型： 默认标准快递，请参考参数字典）
     */
    private String expType;
    /**
     * 物品总重量
     */
    private Double weight;
    /**
     * 包裹数
     */
    private int count;
    /**
     * 备注
     */
    private String remark;
    /**
     * 货物描述
     */
    private String cargo;
    /**
     * 月结或支付账号，详见字典表
     */
    private String partnerId;
    /**
     * 月结账号密钥，详见字典表
     */
    private String partnerKey;
    /**
     * 账号参数，详见字典表
     */
    private String code;
    /**
     * 月结账号用户名，详见字典表
     */
    private String partnerName;
    /**
     * 月结账号用户密码，详见字典表
     */
    private String partnerSecret;
    /**
     * 贸易条款;CFR,DAP等,国际贸易规范用于,默认DAP
     */
    private String tradeTerm;
    /**
     * 申报价值,包裹类必填,货币单位根据currency确定,人民币单位是元
     */
    private Double customsValue;
    /**
     * 包裹信息集合
     */
    private List<PackageInfo> packageInfos;
    /**
     * 出口信息集合,一般包裹类要求必填,文件类不用填,用于清关报备
     */
    private List<ExportInfo> exportInfos;
    /**
     * 货币单位,CNY-人民币;USD-美元;默认CNY
     */
    private String currency;
    /**
     * 关税支付方式,默认收件人支付
     */
    private Payment dutiesPaymentType;
    /**
     * 运费支付方式（默认寄件人支付）SHIPPER:寄方付 CONSIGNEE:到付 MONTHLY:月结  THIRDPARTY:第三方支付
     */
    private Payment freightPaymentType;
    /**
     * 下单时间（格式：yyyy-MM-dd HH:mm:ss,不传或者格式不正确默认当前时间）
     */
    private String shipTime;
    /**
     * 打包方式:默认用户自行打包
     */
    private String packagingType;
    /**
     * 商业发票信息
     */
    private InvoiceInfo invoiceInfo;
    /**
     * 是否需要发票
     */
    private boolean needInvoice = false;
    /**
     * 清关信息
     */
    private CustomsClearance customsClearance;
    /**
     * 时区,默认东八区时间 'GMT+8'预留
     */
    private String timezone;


    private Date deliveryTime;
    /**
     * SI表示千克和厘米组合；SU表示磅和英寸组合
     */
    private String unitOfMeasurement;

    /**
     * 路线ID(极兔国际必填)
     */
    private String routeId;
    /**
     * 是否需要通知
     */
    private boolean needNotification;
    /**
     * 通知郵箱
     */
    private String notifyEmail;
    /**
     * 送达确认签名 （0-不需要签名 1-需提供签名 2-要求成年人签名）
     */
    private int needDeliveryConfirmation;
    /**
     * 是否周六交貨
     */
    private boolean needSaturdayDelivery;
    /**
     * 是否包含电池
     */
    private boolean butterFlag;


}
