package com.kuaidi100.sdk.response;

import lombok.Getter;
import lombok.Setter;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2021-01-06 14:24
 */
@Getter
@Setter
public class ThirdAuthResp {
    // 授权链接
    private String url;
    // 面单需要的partnerKey
    private String partnerKey;
    // 面单需要的parterId
    private String parterId;
    // 面单需要的net
    private String net;
}
