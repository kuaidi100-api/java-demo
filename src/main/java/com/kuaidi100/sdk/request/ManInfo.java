package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 16:30
 */
@Data
public class ManInfo {
    /**
     * 收件人姓名 (必填)
     */
    private String name;
    /**
     * 收件人的手机号，手机号和电话号二者其一必填 (必填)
     */
    private String mobile;
    /**
     * 收件人所在完整地址 (必填)
     */
    private String printAddr;
    /**
     * 收件人所在公司名称(可选)
     */
    private String company;
}
