package com.kuaidi100.sdk.pojo;

import lombok.Data;


@Data
public class HttpResult {
    /**
     * HTTP状态码
     */
    private int status;
    /**
     * HTTP响应正文
     */
    private String body;
    /**
     * 错误信息
     */
    private String error;

    public HttpResult() {
    }

    public HttpResult(int status, String body, String error) {
        this.status = status;
        this.body = body;
        this.error = error;
    }
}
