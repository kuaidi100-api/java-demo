package com.kuaidi100.sdk.response.labelV2;

import lombok.Data;

@Data
public class Result<T> {
    /**
     * 响应状态码：200-成功；其他-失败
     */
    private int code;
    /**
     * 响应数据
     */
    private T data;
    /**
     * 响应结果描述
     */
    private String message = "";
    /**
     * 响应耗时：毫秒
     */
    private long time;

    public boolean isSuccess() {
        return this.code == 200;
    }
}