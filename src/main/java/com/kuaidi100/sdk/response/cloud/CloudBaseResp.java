package com.kuaidi100.sdk.response.cloud;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-10-27 15:58
 */
public class CloudBaseResp<T> {
    /**
     * 响应码
     */
    private String code;
    /**
     * 响应结果描述
     */
    private String message;
    /**
     * 响应数据
     */
    private T data;
}
