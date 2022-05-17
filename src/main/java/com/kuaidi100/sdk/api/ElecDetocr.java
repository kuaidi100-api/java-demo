package com.kuaidi100.sdk.api;

import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;

/**
 * 识别电子面单图片，提取包括收件人和寄件人的姓名、电话、地址以及运单号等字段的信息。
 *
 * @Author: api.kuaidi100.com
 * @Date: 2022-05-17 16:54
 */
public class ElecDetocr extends BaseClient {

    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.ELEC_DETOCR_URL;
    }

}
