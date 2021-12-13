package com.kuaidi100.sdk.request.internationalshipment;

import lombok.Data;

/**
 * 清关信息
 *
 * @Author: ligl
 * @Date: 2021-08-03 17:20
 */
@Data
public class CustomsClearance {
    /**
     * 用途(具体参考每个快递公司)
     * GIFT
     * NOT_SOLD
     * PERSONAL_EFFECTS
     * REPAIR_AND_RETURN
     * SAMPLE
     * SOLD
     */
    private String purpose;
    /**
     * 是否是文件（默认 true 文件）
     */
    private boolean isDocument;
}
