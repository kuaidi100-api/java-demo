package com.kuaidi100.sdk.response.backorder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @description: 运单附件查询响应类
 * @author: api.kuaidi100.com
 * @date: 2024/4/28
 * @version: 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BackOrderResp {

    /**
     * 任务id
     */
    private String taskId;
    /**
     * 运单附件列表
     */
    private List<BackOrderFile> files;

}
