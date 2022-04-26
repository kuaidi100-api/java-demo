package com.kuaidi100.sdk.response;

import lombok.Data;

/**
 * @Author: ligl
 * @Date: 2022-04-26 15:58
 */
@Data
public class BranchAccount {
    /**
     * 网点编号
     */
    private String branchCode;
    /**
     * 网点名称
     */
    private String branchName;
    /**
     * 电子面单余额数量
     */
    private Integer quantity;
    /**
     * 网点名称，网点编号
     */
    private String tbNet;
}
