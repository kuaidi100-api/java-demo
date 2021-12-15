package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-14 16:13
 */
@Data
public class QueryTrackData {
    /**
     * 时间，原始格式
     */
    private String time;
    /**
     * 物流轨迹节点内容
     */
    private String context;
    /**
     * 格式化后时间
     */
    private String ftime;
    /**
     * 行政区域的编码
     */
    private String areaCode;
    /**
     * 行政区域的名称
     */
    private String areaName;
    /**
     * 签收状态 (0在途，1揽收，2疑难，3签收，4退签，5派件，6退回，7转投)
     */
    private String status;
    /**
     * 本数据元对应的行政区域经纬度，resultv2=4或6标记后才会出现
     */
    private String areaCenter;
    /**
     * 本数据元对应的行政区域拼音，resultv2=4或6标记后才会出现
     */
    private String areaPinYin;
    /**
     * 状态值
     */
    private String statusCode;
}
