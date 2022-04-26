package com.kuaidi100.sdk.response;

import lombok.Data;

import java.util.List;

/**
 * @Author: ligl
 * @Date: 2022-04-26 15:57
 */
@Data
public class ThirdPlatformRestData {
    /**
     * 快递公司编码
     */
    private String com;
    /**
     * 快递公司名称
     */
    private String comName;
    /**
     * 快递公司网点列表
     */
    private List<BranchAccount> branchAccounts;
}
