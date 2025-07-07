package com.kuaidi100.sdk.response.labelV2;

import com.kuaidi100.sdk.response.PredictedRoute;
import lombok.Data;

import java.util.List;

/**
 * @description : 快递预估时效查询响应类
 * @author: kuaidi100
 * @date: 2023/10/10
 * @version:
 */
@Data
public class DeliveryTimeResp {
    /**
     * 任务id，建议记录用于后期排查问题
     */
    private String taskId;
    /**
     * 出发地名称(快递100实际解析的地址)
     */
    private String fromName;
    /**
     * 出发地编码
     */
    private String  fromNum;
    /**
     * 目的地名称(快递100实际解析的地址)
     */
    private String toName;
    /**
     * 目的地编码
     */
    private String toNum;
    /**
     * 预计到达时间，格式yyyy-MM-dd HH:mm:ss, 例如：2023-08-08 08:08:08
     */
    private String arrivalTime;
    /**
     * 到达需要花费的时间，单位天
     */
    private String deliveryExpendTime;
    /**
     * 预估路线
     */
    private List<PredictedRoute> predictedRoute;
    /**
     * 产品类型
     */
    private String expType;

}
