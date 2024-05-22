package com.kuaidi100.sdk.response.addressResolution;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @description: 地址解析响应行政区
 * @author: api.kuaidi100.com
 * @date: 2024/5/21
 * @version: 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressResolutionXZQ {
    /**
     * 完整地址
     */
    private String fullName;

    /**
     * 省份名称
     */
    private String province;

    /**
     * 城市名称
     */
    private String city;

    /**
     * 区县名称
     */
    private String district;

    /**
     * 详细地址
     */
    private String subArea;

    /**
     * 父节点编码
     */
    private String parentCode;

    /**
     * 行政区编码
     */
    private String code;

    /**
     * 行政区级别
     */
    private Integer level;

}
