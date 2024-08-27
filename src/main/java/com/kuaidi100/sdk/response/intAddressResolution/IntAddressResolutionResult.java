package com.kuaidi100.sdk.response.intAddressResolution;

import lombok.Data;

/**
 * @description:
 * @author: api.kuaidi100.com
 * @date: 2024/6/24
 * @version: 1.0.0
 */
@Data
public class IntAddressResolutionResult {
    /**
     * 国家
     */
    private String country;

    /**
     * 州
     */
    private String province;

    /**
     * 城市
     */
    private String city;

    /**
     * 区县
     */
    private String district;

    /**
     * 路名/街道名
     */
    private String route;

    /**
     * 街道编号
     */
    private String streetNum;

    /**
     * 邮编
     */
    private String postcode;
}
