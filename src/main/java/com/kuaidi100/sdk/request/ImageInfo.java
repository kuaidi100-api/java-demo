package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-02-17 17:36
 */
@Data
public class ImageInfo {
    /**
     * BASE_64：base64 图片格式；URL：图片地址；QR_CODE：二维码；CODE_128：code128格式的条形码
     */
    private String type;
    /**
     * 图片内容
     */
    private String content;
    /**
     * 图片宽度
     */
    private String width;
    /**
     * 图片高度
     */
    private String height;
}
