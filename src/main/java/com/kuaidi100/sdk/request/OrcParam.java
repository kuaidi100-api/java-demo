package com.kuaidi100.sdk.request;

import lombok.Data;

import java.util.List;

/**
 * @Author: ligl
 * @Date: 2022-05-17 17:00
 */
@Data
public class OrcParam {
    /**
     * 图像数据，base64编码，要求base64编码后大小不超过4M,支持jpg/jpeg/png/bmp格式
     */
    private String image;
    /**
     * 是否兼容图像倾斜，true：是；false：否，默认不检测，即：false
     */
    private boolean enableTilt;
    /**
     * 需要检测识别的面单元素。取值范围：barcode,qrcode,receiver,sender,bulkpen。不传或者 null 则默认为 ["barcode", "receiver", "sender"]
     */
    private List<String> include;
    /**
     * 图片URL。image、imageUrl、pdfUrl三者必填其一，优先顺序：image>imageUrl>pdfUrl，最大长度不超过1024b，下载超时默认为2s
     */
    private String  imageUrl;
    /**
     * PDF文件URL。image、imageUrl、pdfUrl三者必填其一，优先顺序：image>imageUrl>pdfUrl，最大长度不超过1024b，下载超时默认为2s
     */
    private String pdfUrl;
}
