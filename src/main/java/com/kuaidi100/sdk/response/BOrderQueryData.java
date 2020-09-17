package com.kuaidi100.sdk.response;

import lombok.Data;

import java.util.List;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-09-17 14:17
 */
@Data
public class BOrderQueryData {

    private String province;

    private String city;

    private String district;

    private String addr;

    private String latitude;

    private String longitude;

    private List<BOrderQueryDataInfo> mktInfo;
}
