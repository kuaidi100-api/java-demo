package com.kuaidi100.sdk.response.bsamecity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @description : 费用明细类
 * @author: api.kuaidi100.com
 * @date: 2023/3/7
 * @version:
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FeeDetail {
    /**
     * 费用类型	详见附录：费用类型对照表
     */
    private int feeType;
    /**
     * 费用名称
     */
    private String feeDesc;
    /**
     * 费用明细金额（单位元）
     */
    private String amount;
}
