package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-14 16:16
 */
@Data
public class QueryTrackPosition {

    /**
     * 地址编码
     */
    private String number;
    /**
     * 地址名称
     */
    private String name;
}
