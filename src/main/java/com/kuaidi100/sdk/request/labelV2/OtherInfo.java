package com.kuaidi100.sdk.request.labelV2;

import lombok.Data;

/**
 {
 *         "subsidySource": "dy",
 *             "infoCollectSource": "dy",
 *             "wpMerchantCode": "123",
 *             "wpServiceCode": "123",
 *             "wpExtJson": "{\"sn\":\"123456\",\"imei\":\"123456\"}"
 *     }
 */
@Data
public class OtherInfo {

    /**
     * 国补标识，dy为抖音；sn为苏宁；tb为淘天；pdd为拼多多；
     * ks为快手；wph为唯品会；dw为得物；xhs为小红书；
     * sph为视频号；merchant为商家自营国补；cancel为取消标识
     */
    private String subsidySource;

    /**
     * 采集服务标识，dy为抖音；sn为苏宁；tb为淘天；
     * pdd为拼多多；ks为快手；wph为唯品会；dw为得物；
     * xhs为小红书；sph为视频号；merchant为商家自营采集服务；
     * cancel为取消标识
     */
    private String infoCollectSource;

    /**
     * 微派商户编码，微派会给每个接入客户提供一个唯一编码
     */
    private String wpMerchantCode;

    /**
     * 微派任务编码，生产环境需与微派申请任务编码
     */
    private String wpServiceCode;

    /**
     * 扩展JSON字段，格式示例：{"sn":"123456","imei":"123456"}
     * - sn为sn编码，只支持一个
     * - imei为手机/平板的IMEI号，只支持一个
     */
    private String wpExtJson;

    /**
     *"BP20250116002"//新增字段，对应productAttrs.activateVerificationTemplate
     */
    private String  activateVerificationTemplate;
    /**
     * "94ZT00001,94ZT00001",//新增字段，对应productAttrs.snImeiNumber
     */
    private String  snImeiNumber;
    /**
     * "customizedVerification"//新增字段，对应productAttrs.activateVerificationType
     */
    private String  activateVerificationType;

}
