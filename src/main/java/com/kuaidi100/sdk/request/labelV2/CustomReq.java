package com.kuaidi100.sdk.request.labelV2;

import com.kuaidi100.sdk.contant.PrintType;
import lombok.Data;

import java.util.Map;

/**
 * @Author: ligl
 * @Date: 2022-06-27 11:00
 */
@Data
public class CustomReq {

    /**
     * 快递100模板url
     */
    private String tempId;
    /**
     * 打印类型（HTML,IMAGE,CLOUD）
     * HTML:生成html短链
     * IMAGE:生成图片短链
     * CLOUD:使用快递100云打印机打印，使用CLOUD时siid必填
     */
    private PrintType printType;

    /**
     * 打印设备，通过打印机输出的设备码进行获取
     */
    private String siid;

    /**
     * 打印方向（默认0） 0-正方向 1-反方向
     */
    private String direction;

    /**
     * 自定义参数，优先级高于系统生成值，即出现相同key时，使用该参数的value
     */
    private Map<String,Object> customParam;
    /**
     * 打印状态回调地址
     */
    private String callBackUrl;
}
