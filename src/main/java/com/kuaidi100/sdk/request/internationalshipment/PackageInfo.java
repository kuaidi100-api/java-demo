package com.kuaidi100.sdk.request.internationalshipment;

import lombok.Data;

/**
 * 国际包裹信息
 *
 * @Author: ligl
 * @Date: 2021-10-21 11:20
 */
@Data
public class PackageInfo {
    /**
     * 高度;单位厘米,默认1.0
     */
    private Double height;
    /**
     * 宽度;单位厘米, 默认10.0
     */
    private Double width;
    /**
     * 长度;单位厘米默认10.0
     */
    private Double length;
    /**
     * 重量; 单位千克,默认0.1
     */
    private Double weight;
    /**
     * 该包裹的备注信息之类
     */
    private String packageReference;

}
