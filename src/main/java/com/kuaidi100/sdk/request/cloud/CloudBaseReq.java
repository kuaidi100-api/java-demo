package com.kuaidi100.sdk.request.cloud;

import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.utils.SignUtils;
import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-10-27 15:45
 */
@Data
public class CloudBaseReq extends BaseRequest {
    /**
     * 用户授权key
     */
    private String secret_key;
    /**
     * 接口编号
     */
    private String secret_code;
    /**
     * 加密签名：md5(secret_key+secret_secret)转大写
     */
    private String secret_sign;

    private String secret_secret;

    public String getSecret_sign() {
        return SignUtils.sign(secret_key+secret_secret);
    }
}
