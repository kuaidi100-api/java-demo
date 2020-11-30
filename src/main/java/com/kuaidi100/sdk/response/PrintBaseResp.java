package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 18:48
 */
@Data
public class PrintBaseResp<T> {

    private String returnCode;

    private boolean result;

    private String message;

    private T data;
}
