package com.kuaidi100.sdk.request.labelV2;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-06-27 11:00
 */
@Data
public class RepeatPrintReq {
    /**
     * 任务ID,对应下单时返回的taskId
     */
    private String taskId;
    /**
     * 快递100打印机,不填默认为下单时填入的siid
     */
    private String siid;
}
