package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @author Mali
 * @since 2021/7/21 15:29
 */
@Data
public class PrintInternationData {
    /**
     * 快递单号
     */
    private String kuaidinum;
    /**
     * 不明
     */
    private String pdf;
    /**
     * 不明
     */
    private String pkgNums;
}
