package com.kuaidi100.sdk.response.backorder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @description:
 * @author: api.kuaidi100.com
 * @date: 2024/4/28
 * @version: 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BackOrderFile {

    /**
     * 三方附件类型
     */
    private String fileType;

    /**
     * 附件下载地址
     */
    private String fileUrl;

}
