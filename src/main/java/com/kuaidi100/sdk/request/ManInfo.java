package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 16:30
 */
@Data
public class ManInfo {
    /**
     * 姓名 (必填)
     */
    private String name;
    /**
     * 手机号，手机号和电话号二者其一必填 (必填)
     */
    private String mobile;
    /**
     * 完整地址（国内快递）
     */
    private String printAddr;
    /**
     * 完整地址（国际快递）
     */
    private String addr;
    /**
     * 收件人所在公司名称(可选)
     */
    private String company;
    /**
     * 	郡|县,可作为收件地址补充
     */
    private String district;
    /**
     * 州|省,可作为收件地址补充
     */
    private String province;
    /**
     * 国家代号 CN-中国 ,US-美国等, 详见字典表
     */
    private String countryCode;
    /**
     * 城市
     */
    private String city;
    /**
     * 邮编
     */
    private String zipcode;
    /**
     * 电话
     */
    private String tel;
    /**
     * 邮箱
     */
    private String email;
}
