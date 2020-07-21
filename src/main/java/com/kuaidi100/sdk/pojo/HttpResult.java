package com.kuaidi100.sdk.pojo;

import lombok.Data;


@Data
public class HttpResult {
    private int status;
    private String body;
    private String error;

    public HttpResult() {
    }

    public HttpResult(int status, String body, String error) {
        this.status = status;
        this.body = body;
        this.error = error;
    }
}
