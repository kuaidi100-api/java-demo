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
     * 电话号，手机号和电话号二者其一必填 (必填)
     */
    private String tel;
    /**
     * 所在完整地址 (必填)
     */
    private String printAddr;
    /**
     * 所在公司名称(可选)
     */
    private String company;
    /**
     * 省(printAddr为空时必填)
     */
    private String province;
    /**
     * 市(printAddr为空时必填)
     */
    private String city;
    /**
     * 区／县(printAddr为空时必填)
     */
    private String district;
    /**
     * 详细地址(printAddr为空时必填)
     */
    private String addr;
    /**
     * 详细地址加密，目前抖音／拼多多用到
     */
    private String detailAddrEnc;
}
