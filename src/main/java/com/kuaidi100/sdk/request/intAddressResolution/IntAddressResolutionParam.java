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
     * 国家/地区二字码（不区分大小写），可参考 国家/地区二字码列表附录
     */
    private String code;

    /**
     * 国际地址，如84 Alford Rd, Great Barrington, MA 01230, USA
     */
    private String address;

    /**
     * 语言码（不区分大小写），可参考 支持的语言列表附录。该字段决定响应的解析结果以哪种语言进行展示
     */
    private String language;

}
