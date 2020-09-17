package com.kuaidi100.sdk.response;

import lombok.Data;

import java.util.List;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-08-28 14:24
 */
@Data
public class SubscribePushResult {
    /**
     * 消息体，请忽略
     */
    private String message;
    /**
     * 快递单当前状态，包括0在途，1揽收，2疑难，3签收，4退签，5派件，6退回，7转投 等8个状态
     */
    private String state;
    /**
     * 通讯状态，请忽略
     */
    private String status;
    /**
     * 快递单明细状态标记，暂未实现，请忽略
     */
    private String condition;
    /**
     * 是否签收标记
     */
    private String ischeck;
    /**
     * 快递公司编码,一律用小写字母，点击查看快递公司编码
     */
    private String com;
    /**
     * 快递单号
     */
    private String nu;
    /**
     * 数组，包含多个对象，每个对象字段如展开所示
     */
    private List<SubscribePushData> data;
}
