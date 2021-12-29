package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * 包裹信息
 *
 * @author Mali
 * @since 2021/7/21 15:10
 */
@Data
public class PackageInfo {
    private Integer count;
    /**
     * 高度;单位厘米,默认1.0
     */
    private String height;
    /**
     * 宽度;单位厘米, 默认10.0
     */
    private String width;
    /**
     * 长度;单位厘米默认10.0
     */
    private String length;
    /**
     * 重量; 单位千克,默认0.1
     */
    private Double weight;
    /**
     * 	该包裹的备注信息之类
     */
    private String packageReference;
}
