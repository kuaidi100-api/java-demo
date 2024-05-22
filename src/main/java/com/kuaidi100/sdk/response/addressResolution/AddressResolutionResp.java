package com.kuaidi100.sdk.response.addressResolution;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @description: 快递100api地址解析响应类
 * @author: api.kuaidi100.com
 * @date: 2024/5/21
 * @version: 1.0.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressResolutionResp {
    /**
     * 任务id
     */
    private String taskId;

    /**
     * 解析结果
     */
    private List<AddressResolutionRespItem> result;
}
