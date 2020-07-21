package com.kuaidi100.sdk.response;

import lombok.Data;

import java.util.List;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 19:29
 */
@Data
public class PrintHtmlResp {

    private String taskId;

    private String message;

    private String status;

    private boolean result;

    private List<PrintHtmlData> data;
}
