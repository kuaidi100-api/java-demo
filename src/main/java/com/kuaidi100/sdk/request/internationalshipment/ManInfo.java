package com.kuaidi100.sdk.request.internationalshipment;

import lombok.Data;

@Data
public class ManInfo {
    /**
     * 姓名
     */
    private String name;
    /**
     * 手机号，手机号和电话号二者其一必填
     */
    private String mobile;
    /**
     * 电话号，手机号和电话号二者其一必填
     */
    private String tel;
    /**
     * 城市
     */
    private String city;
    /**
     * 收件人所在完整地址
     */
    private String addr;
    /**
     * 州|省,可作为收件地址补充
     */
    private String province;
    /**
     * 郡|县,可作为收件地址补充
     */
    private String district;
    /**
     * 公司名称
     */
    private String company;
    /**
     * 邮编
     */
    private String zipcode;
    /**
     * 国家代号 CN-中国 ,US-美国等, 详见字典表
     */
    private String countryCode;
    /**
     * 邮箱
     */
    private String email;
    /**
     * 州或省代号,美国必填,例如纽约州-NY
     */
    private String stateOrProvinceCode;
    /**
     * 税号
     */
    private String taxId;
    /**
     * 纳税人类型
     */
    private String taxType;
    /**
     * VAT税号(数字或字母)；欧盟国家(含英国)使用的增值税号；
     */
    private String vatNum;
    /**
     * EORI号码(数字或字母)；欧盟入关时需要EORI号码，用于商品货物的清关
     */
    private String eoriNum;
    /**
     * IOSS号码
     */
    private String iossNum;
}
