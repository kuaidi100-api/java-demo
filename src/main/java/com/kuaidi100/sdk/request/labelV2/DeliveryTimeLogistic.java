package com.kuaidi100.sdk.request.labelV2;

import lombok.Data;

/**
 * 物流轨迹信息
 *
 * @author kuaidi100
 */
@Data
public class DeliveryTimeLogistic {
    /**
     * 物流轨迹发生时间，例如"2025-05-09 13:15:26"
     */
    private String time;
    /**
     * 物流轨迹信息，例如"您的快件离开【吉林省吉林市桦甸市】，已发往【长春转运中心】"
     */
    private String context;
}
