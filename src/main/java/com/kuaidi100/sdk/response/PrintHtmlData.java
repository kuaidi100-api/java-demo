package com.kuaidi100.sdk.response;

import lombok.Data;

import java.util.List;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 19:31
 */
@Data
public class PrintHtmlData {
    /**
     * html代码
     */
    private List<String> template;
    /**
     * 快递单号
     */
    private String kuaidinum;
    /**
     * 大头笔
     */
    private String bulkpen;
    /**
     * 电子面单链接
     */
    private List<String> templateurl;
}
