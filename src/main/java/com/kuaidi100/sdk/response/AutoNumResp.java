package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 10:04
 */
@Data
public class AutoNumResp {
    /**
     * 请忽略
     */
    public String lengthPre;
    /**
     * 快递公司对应的编码
     */
    private String comCode;
    /**
     * 请忽略
     */
    private String noPre;
    /**
     * 请忽略
     */
    private String noCount;
}
