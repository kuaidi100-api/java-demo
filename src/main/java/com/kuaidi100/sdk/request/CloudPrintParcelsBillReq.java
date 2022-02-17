package com.kuaidi100.sdk.request;

import lombok.Data;

import java.util.List;

/**
 * @Author: ligl
 * @Date: 2022-02-17 17:34
 */
@Data
public class CloudPrintParcelsBillReq<T> {
    /**
     * 通过管理后台的打印发货单模板配置信息获取
     */
    private String tempid;
    /**
     * 打印设备，通过打印机输出的设备码进行获取
     */
    private String siid;
    /**
     * 打印状态回调地址，默认仅支持http
     */
    private String callBackUrl;
    /**
     * 发货单表格列表内容，JsonArrayString类型，多表格时用tab0，tab1，tab2等追加对象
     */
    private List<T> tb0;
    /**
     * 多图片时用img0,img1,img2等追加
     */
    private ImageInfo img0;
}
