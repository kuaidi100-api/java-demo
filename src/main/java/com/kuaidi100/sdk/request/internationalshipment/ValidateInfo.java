package com.kuaidi100.sdk.request.internationalshipment;

import lombok.Data;

@Data
public class ValidateInfo {
    /**
     * 月结或支付账号，详见字典表
     */
    private String partnerId;
    /**
     * 月结账号用户名，详见字典表
     */
    private String partnerName;
    /**
     * 月结账号密钥，详见字典表
     */
    private String partnerKey;
    /**
     * 月结账号用户密码，详见字典表
     */
    private String partnerSecret;
    /**
     * 账号参数，详见字典表
     */
    private String code;
}