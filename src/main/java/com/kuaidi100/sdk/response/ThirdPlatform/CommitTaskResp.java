package com.kuaidi100.sdk.response.ThirdPlatform;

import lombok.Data;

import java.util.List;

/**
 * @Author: ligl
 * @Date: 2022-02-17 15:48
 */
@Data
public class CommitTaskResp {
    /**
     * 任务总数
     */
    private int total;
    /**
     * 任务类别
     */
    private List<TaskDetails> tasks;
}
