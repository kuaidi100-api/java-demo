package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 17:05
 */
@Data
public class PrintCloudParam extends PrintCommonReq{
    /**
     * 电子面单模板编码
     */
    private String tempid;
    /**
     * 打印设备编码。通过打印机输出的设备码进行获取
     */
    private String siid;
    /**
     * 打印状态回调地址
     */
    private String callBackUrl;
    /**
     * 打印方向（默认0） 0-正方向 1-反方向
     */
    private String direction;
}
