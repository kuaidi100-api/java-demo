package com.kuaidi100.sdk.response;

import lombok.Data;

import java.util.List;

/**
 * @author Mali
 * @since 2021/7/21 15:29
 */
@Data
public class PrintInternationResp {
    /**
     * 返回报文描述
     */
    private String message;
    /**
     * 返回编码
     */
    private String status;
    /**
     * true提交成功，false失败
     */
    private boolean result;

    private List<PrintInternationData> data;
}
