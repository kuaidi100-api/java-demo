package com.kuaidi100.sdk.response.samecity;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2021-02-20 9:53
 */
@Data
public class OrderResp {
   /**
    * 快递100任务id（归属快递100）
    */
   private String taskId;
   /**
    * 快递公司
    */
   private String com;
   /**
    * 快递100订单号（归属快递100）
    */
   private String orderId;
   /**
    * 费用
    */
   private Integer fee;
   /**
    * 距离（公里）
    */
   private Integer distance;
   /**
    * 快递公司单号
    */
   private String kuaidiNum;
}
