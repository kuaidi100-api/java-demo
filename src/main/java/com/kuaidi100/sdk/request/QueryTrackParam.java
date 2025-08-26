package com.kuaidi100.sdk.request;

import lombok.Data;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-14 15:58
 */
@Data
public class QueryTrackParam {
    /**
     * 查询的快递公司的编码，一律用小写字母
     */
    private String com;
    /**
     * 查询的快递单号， 单号的最大长度是32个字符
     */
    private String num;
    /**
     * 收件人或寄件人的手机号或固话
     */
    private String phone;
    /**
     * 出发地城市，省-市-区
     */
    private String from;
    /**
     * 目的地城市，省-市-区
     */
    private String to;
    /**
     * 添加此字段表示开通行政区域解析功能。
     * 空：关闭（默认）；
     * 1：开通行政区域解析功能以及物流轨迹增加物流状态名称；
     * 4: 开通行政解析功能以及物流轨迹增加物流高级状态名称、状态值并且返回出发、目的及当前城市信息；
     * 8：在4的基础上额外返回预计到达时间和预计轨迹信息，支持的快递公司见在途时效预估支持的快递公司
     */
    private String resultv2 = "0";
    /**
     * 返回数据格式。0：json（默认），1：xml，2：html，3：text
     */
    private String show = "0";
    /**
     * 返回结果排序方式。desc：降序（默认），asc：升序
     */
    private String order = "desc";
    /**
     * 语言类型。zh：中文（默认），en：英文
     */
    private String lang;

    /**
     * 默认为false，当入参为true时，会尝试从物流轨迹中提取出快递员姓名和快递员电话并返回
     */
    private Boolean needCourierInfo;
}
