package com.kuaidi100.sdk.response;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 18:52
 */
@Data
public class PrintImgData {

    private String taskId;

    private String eOrder;

    private String kuaidinum;

    private String kuaidicom;

    private String imgBase64;
}
