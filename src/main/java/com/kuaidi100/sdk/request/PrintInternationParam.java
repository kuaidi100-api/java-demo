package com.kuaidi100.sdk.request;
import lombok.Data;

import java.util.List;

/**
 * @author Mali
 *
 * @since 2021/7/21 9:47
 */
@Data
public class PrintInternationParam {
    /**
     * 电子面单账户号码，需向快递公司在贵司当地的网点申请
     */
    private String partnerId;
    /**
     * 电子面单账户号码，需向快递公司在贵司当地的网点申请（dhl）
     */
    private String partnerName;
    /**
     *  电子面单承载编号，需向快递公司在贵司当地的网点申请（fedex）
     */
    private String code;
    /**
     * 电子面单账户密码，需向快递公司在贵司当地的网点申请（fedex）
     */
    private String partnerKey;
    /**
     * 电子面单密钥，需向快递公司在贵司当地的网点申请
     */
    private String partnerSecret;
    /**
     * 快递公司的编码，一律用小写字母
     */
    private String kuaidicom;
    /**
     * 收件人信息
     */
    private ManInfo recMan;
    /**
     * 寄件人信息
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
    private Integer count;
    /**
     * 物品总重量，单位：KG （例子：0.5）
     */
    private Double weight;
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
     * 支付方式：<br/>
     * SHIPPER:寄方付（默认）<br/>
     * CONSIGNEE:到付<br/>
     * MONTHLY:月结<br/>
     * THIRDPARTY:第三方支付<br/>
     */
    private String payType;
    /**
     * 产品类型： 默认标准快递<br/>
     *<br/>
     * dhl（DHL）<br/>
     * 标准快递<br/>
     * 文件-普通服务<br/>
     * 包裹-普通服务<br/>
     *<br/>
     * fedex（Fedex）<br/>
     * International Priority<br/>
     * International First<br/>
     * International Economy<br/>
     */
    private String expType;
    /**
     * 备注
     */
    private String remark;
    /**
     * 出口商品码,建议填写,加快清关速度
     */
    private String exportCommodityCode;
    /**
     * 	进口商品码,建议填写,加快清关速度
     */
    private String importCommodityCode;
    /**
     * 申报价值,包裹类必填,货币单位根据currency确定,人民币单位是元
     */
    private Double customsValue;
    /**
     * 	贸易条款;CFR,DAP等,国际贸易规范用于,默认DAP
     */
    private String tradeTerm;
    /**
     * 货币单位,CNY-人民币;USD-美元;默认CNY
     */
    private String currency;
    /**
     * 包裹信息集合
     */
    private List<PackageInfo> packageInfos;
    /**
     * 出口信息集合,一般包裹类要求必填,文件类不用填,用于清关报备
     */
    private List<ExportInfo> exportInfos;
}
