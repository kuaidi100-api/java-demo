package com.kuaidi100.sdk.response.ThirdPlatform;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-02-17 15:39
 */
@Data
public class ThirdPlatformBaseResp<T> {

    private boolean result;

    private int returnCode;

    private String message;

    private T data;
}
