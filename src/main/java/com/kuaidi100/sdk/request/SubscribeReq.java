package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-16 13:41
 */
@Data
public class SubscribeReq {
    /**
     * 返回数据格式(json、xml、text)
     */
    private String schema;
    /**
     * 其他参数
     */
    private SubscribeParam param;
}
