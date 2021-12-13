package com.kuaidi100.sdk.response.internationalshipment;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2021-08-09 17:27
 */
@Data
public class Document {
    /**
     * 文件格式,pdf,png之类
     */
    private String type;

    /**
     * base64
     */
    private String content;
    /**
     * 文件链接
     */
    private String url;
}
