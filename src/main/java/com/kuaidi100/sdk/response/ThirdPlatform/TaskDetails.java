package com.kuaidi100.sdk.response.ThirdPlatform;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-02-17 15:49
 */
@Data
public class TaskDetails {
    /**
     * 任务编码
     */
    private String taskId;
    /**
     * 订单更新的最小时间，格式：yyyy-MM-dd HH:mm:ss
     */
    private String updateAtMin;
    /**
     * 订单更新的最大时间，格式：yyyy-MM-dd HH:mm:ss
     */
    private String updateAtMax;
}
