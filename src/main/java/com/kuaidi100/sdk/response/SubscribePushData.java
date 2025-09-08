package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-08-28 14:24
 */
@Data
public class SubscribePushData {
    /**
     * 物流轨迹节点内容
     */
    private String context;
    /**
     * 时间，原始格式
     */
    private String time;
    /**
     * 格式化后时间
     */
    private String ftime;
    /**
     * 本数据元对应的签收状态。只有在开通签收状态服务（见上面"status"后的说明）且在订阅接口中提交resultv2标记后才会出现
     */
    private String status;
    /**
     * 本数据元对应的行政区域的编码，只有在开通签收状态服务（见上面"status"后的说明）且在订阅接口中提交resultv2标记后才会出现
     */
    private String areaCode;
    /**
     * 本数据元对应的行政区域的名称，开通签收状态服务（见上面"status"后的说明）且在订阅接口中提交resultv2标记后才会出现
     */
    private String areaName;
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

    /**
     * 快件当前地点
     */
    private String location;
}
