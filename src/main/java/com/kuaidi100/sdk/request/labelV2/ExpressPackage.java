package com.kuaidi100.sdk.request.labelV2;

import lombok.Data;

@Data
public class ExpressPackage {

    //重量
    private String weight;

    //体积
    private String volume;

    //批量的箱号，与com.kuaidi100.api.elecprintpojo.facade.vo.OrderWithLabelParam.boxNo 功能一致
    private String boxNo;

    //名称
    private String name;


    //============================================city560=============================================
    //温度区间最大值（需要乘以100）
    private String tempRangeMax;

    //温度区间最小值（需要乘以100）
    private String tempRangeMin;

    //数量
    private int count;

    //样本类型
    private String sampleType;

}
