package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * 商家寄件(官方快递)
 *
 * @Author: api.kuaidi100.com
 * @Date: 2021-03-22 15:29
 */
@Data
public class BOrderOfficialQueryDetailReq {
    /**
     * 下单时返回的任务ID
     */
    private String taskId;
}
