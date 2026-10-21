package com.kuaidi100.sdk.request.labelV2;

import lombok.Data;

@Data
public class AddExtraInfo {

    /**
     * 微信渠道相关信息
     */
    private WxChannelInfo wechatChannels;

    /**
     * 顺丰渠道相关信息
     */
    private ShunFengChannelInfo shunfengChannels;

    /**
     * 城市应急56相关信息
     */
    private City56ChannelInfo city56;
}
