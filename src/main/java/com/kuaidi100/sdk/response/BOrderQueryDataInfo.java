package com.kuaidi100.sdk.response;

import lombok.Data;
import sun.dc.pr.PRError;

import java.util.List;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-09-17 14:24
 */
@Data
public class BOrderQueryDataInfo {
    /**
     * 业务服务类型
     */
    private List<String> serviceType;
    /**
     * 支持的快递公司编码
     */
    private String kuaidiCom;

}
