package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-11-25 16:11
 */
@Data
public class BaseResponse<T> {

    private boolean result;

    private String message;

    private String status;

    private T data;
}
