package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 16:55
 */
@Data
public class PrintHtmlParam extends PrintCommonReq{
    /**
     * 是否返回面单
     * 0：不需要(默认)
     * 1：需要
     * 如果需要，则返回要打印的模版的HTML代码，贵司可以直接将之显示到IE等浏览器，然后通过浏览器进行打印
     */
    private String needTemplate;
}
