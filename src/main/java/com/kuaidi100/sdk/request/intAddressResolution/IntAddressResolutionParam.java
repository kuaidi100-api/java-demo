package com.kuaidi100.sdk.request.intAddressResolution;

import lombok.Data;

/**
 * @description: 国际地址解析接口请求参数类
 * @author: api.kuaidi100.com
 * @date: 2024/6/24
 * @version: 1.0.0
 */
@Data
public class IntAddressResolutionParam {
    /**
     * 国家（英文），可参考国家列表附录，如 United States
     */
    private String address;

    /**
     * 地址， 如 84 Alford Rd, Great Barrington, MA 01230, USA
     */
    private String country;

}
