package com.kuaidi100.sdk.response;

import lombok.Data;

import java.util.List;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-14 16:07
 */
@Data
public class QueryTrackResp {
    /**
     * 消息体，请忽略
     */
    private String message;
    /**
     * 快递单号
     */
    private String nu;
    /**
     * 是否签收标记
     */
    private String ischeck;
    /**
     * 	快递公司编码,一律用小写字母
     */
    private String com;
    /**
     * 通讯状态
     */
    private String status;
    /**
     * 轨迹详情数组
     */
    private List<QueryTrackData> data;
    /**
     * 快递单当前状态，包括0在途，1揽收，2疑难，3签收，4退签，5派件，6退回，7转投，10待清关，11清关中，12已清关，13清关异常，14拒签 等13个状态
     */
    private String state;
    /**
     * 快递单明细状态标记
     */
    private String condition;
    /**
     * 轨迹位置信息
     */
    private QueryTrackRouteInfo routeInfo;
    /**
     * 物流节点数据，包含物流轨迹上各个节点的信息，节点排序为从发货地址到收货地址，实时查询接口中提交resultv2=8标记后才会出现
     */
    private List<PredictedRoute> predictedRoute;
    /**
     * 查不到轨迹或者其他问题返回码
     */
    private String returnCode;
    /**
     * 查不到轨迹或者其他问题返回结果
     */
    private boolean result;
    /**
     * 预计到达时间
     */
    private String arrivalTime;
    /**
     * 平均耗时
     */
    private String totalTime;
    /**
     * 到达还需多少时间
     */
    private String remainTime;
    /**
     * 是否存在环路
     */
    private Boolean isLoop;

    /**
     * 从物流轨迹中提取出的快递员信息，当且仅当入参needCourierInfo=True时会返回
     * pickupManName：揽件快递员姓名，例如："张三"，如提取不到会返回空字符串
     * pickupManPhone：揽件快递员手机号，格式为："12335467890"，如提取出多个手机号，会使用逗号分隔，例如"1234567890,1983782937",提取不到会返回空字符串
     * deliveryManName:派件快递员姓名，例如："李四"，如提取不到会返回空字符串
     * deliveryManPhone:派件快递员手机号，格式为："12335467890"，如提取出多个手机号，会使用逗号分隔，例如"1234567890,1983782937",提取不到会返回空字符串
     */
    private CourierInfo courierInfo;
}
