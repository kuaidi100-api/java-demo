package com.kuaidi100.sdk.response.intAddressResolution;

import lombok.Data;

/**
 * @description:
 * @author: api.kuaidi100.com
 * @date: 2024/6/24
 * @version: 1.0.0
 */
@Data
public class IntAddressResolutionResp {
    /**
     * 任务id
     */
    private String taskId;

    /**
     * 解析结果
     */
    private IntAddressResolutionResult result;
}
