package com.kuaidi100.sdk.request.addressResolution;

import lombok.Data;

/**
 * @description: 快递100api地址解析接口请求类
 * @author: api.kuaidi100.com
 * @date: 2024/5/21
 * @version: 1.0.0
 */
@Data
public class AddressResolutionParam {

    /**
     * 需要解析的内容， 例如 李雷13544765984广东省深圳市南山区金蝶软件园
     */
    private String content;

    /**
     * 图片base64编码
     */
    private String image;

    /**
     * 图片URL
     */
    private String imageUrl;

    /**
     * pdf URL
     */
    private String pdfUrl;

    /**
     * html链接
     */
    private String htmlUrl;

}
