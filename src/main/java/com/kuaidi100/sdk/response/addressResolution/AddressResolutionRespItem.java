package com.kuaidi100.sdk.response.addressResolution;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @description: 地址解析接口响应结果
 * @author: api.kuaidi100.com
 * @date: 2024/5/21
 * @version: 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressResolutionRespItem {
    /**
     * 内容
     */
    private String content;

    /**
     * 手机号码
     */
    private List mobile;

    /**
     * 姓名
     */
    private String name;

    /**
     * 详细地址
     */
    private String address;

    /**
     * 行政区信息
     */
    private AddressResolutionXZQ xzq;
}
