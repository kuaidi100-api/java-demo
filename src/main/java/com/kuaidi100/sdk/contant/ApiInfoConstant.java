package com.kuaidi100.sdk.contant;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-15 17:43
 */
public class ApiInfoConstant {
    /**
     * 查询url
     */
    public static final String QUERY_URL = "https://poll.kuaidi100.com/poll/query.do";
    /**
     * 快递查询地图轨迹url
     */
    public static final String QUERY_MAP_VIEW_URL = "https://poll.kuaidi100.com/poll/maptrack.do";
    /**
     * 订阅url
     */
    public static final String SUBSCRIBE_URL = "https://poll.kuaidi100.com/poll";
    /**
     * 订阅带地图url
     */
    public static final String SUBSCRIBE_WITH_MAP_URL = "http://poll.kuaidi100.com/pollmap";
    /**
     * 订阅SCHEMA
     */
    public static final String SUBSCRIBE_SCHEMA = "json";
    /**
     * 智能单号识别url
     */
    public static final String AUTO_NUM_URL = "http://www.kuaidi100.com/autonumber/auto?num=%s&key=%s";
    /**
     * 电子面单html url
     */
    public static final String ELECTRONIC_ORDER_HTML_URL = "http://poll.kuaidi100.com/eorderapi.do";
    /**
     * 电子面单html方法
     */
    public static final String ELECTRONIC_ORDER_HTML_METHOD = "getElecOrder";
    /**
     * 电子面单获取图片 url
     */
    public static final String ELECTRONIC_ORDER_PIC_URL = "https://poll.kuaidi100.com/printapi/printtask.do";
    /**
     * 电子面单获取图片
     */
    public static final String ELECTRONIC_ORDER_PIC_METHOD = "getPrintImg";
    /**
     * 国际电子面单下单 url
     */
    public static final String ELECTRONIC_INTERSHIP_URL = "http://poll.kuaidi100.com/eorderapi.do";
    /**
     * 国际电子面单下单
     */
    public static final String ELECTRONIC_INTERSHIP_METHOD = "intership";
    /**
     * 电子面单打印 url
     */
    public static final String ELECTRONIC_ORDER_PRINT_URL = "https://poll.kuaidi100.com/printapi/printtask.do";
    /**
     * 电子面单打印方法
     */
    public static final String ELECTRONIC_ORDER_PRINT_METHOD = "eOrder";
    /**
     * 菜鸟淘宝账号授权
     */
    public static final String AUTH_THIRD_URL = "https://poll.kuaidi100.com/printapi/authThird.do";
    /**
     * 云打印url
     */
    public static final String CLOUD_PRINT_URL = "http://poll.kuaidi100.com/printapi/printtask.do?method=%s&t=%s&key=%s&sign=%s&param=%s";
    /**
     * 自定义打印方法
     */
    public static final String CLOUD_PRINT_CUSTOM_METHOD = "printOrder";
    /**
     * 附件打印方法
     */
    public static final String CLOUD_PRINT_ATTACHMENT_METHOD = "imgOrder";
    /**
     * 复打方法
     */
    public static final String CLOUD_PRINT_OLD_METHOD = "printOld";
    /**
     * 复打方法
     */
    public static final String SEND_SMS_URL = "http://apisms.kuaidi100.com:9502/sms/send.do";
    /**
     * 商家寄件
     */
    public static final String B_ORDER_URL = "https://order.kuaidi100.com/order/borderbestapi.do";
    /**
     * 商家寄件查询运力
     */
    public static final String B_ORDER_QUERY_TRANSPORT_CAPACITY_METHOD = "querymkt";
    /**
     * 商家寄件下单
     */
    public static final String B_ORDER_SEND_METHOD = "bOrderBest";
    /**
     * 商家寄件获取验证码
     */
    public static final String B_ORDER_CODE_METHOD = "getCode";
    /**
     * 商家寄件取消
     */
    public static final String B_ORDER_CANCEL_METHOD = "cancelBest";
    /**
     * 云平台通用请求url
     */
    public static final String CLOUD_NORMAL_URL = "http://cloud.kuaidi100.com/api";
    /**
     * 第三方电商平台账号授权请求url
     */
    public static final String THIRD_AUTH_URL = "https://poll.kuaidi100.com/printapi/authThird.do";
    /**
     * 商家寄件(官方寄件)请求url
     */
    public static final String B_ORDER_OFFICIAL_URL = "https://poll.kuaidi100.com/order/borderapi.do";
    /**
     * 商家寄件(官方寄件)下单
     */
    public static final String B_ORDER_OFFICIAL_ORDER_METHOD = "bOrder";
    /**
     * 商家寄件(官方寄件)取消
     */
    public static final String B_ORDER_OFFICIAL_CANCEL_METHOD = "cancel";
    /**
     * 商家寄件(官方寄件)查询价格
     */
    public static final String B_ORDER_OFFICIAL_PRICE_METHOD = "queryPrice";
    /**
     * 同城配送请求url
     */
    public static final String SAME_CITY_ORDER_URL = "https://order.kuaidi100.com/sameCity/order";
    /**
     * 同城配送授权方法
     */
    public static final String SAME_CITY_AUTH_METHOD = "auth";
    /**
     * 同城配送下单方法
     */
    public static final String SAME_CITY_ORDER_METHOD = "order";
    /**
     * 同城配送查询订单方法
     */
    public static final String SAME_CITY_QUERY_METHOD = "query";
    /**
     * 同城配送取消订单方法
     */
    public static final String SAME_CITY_CANCEL_METHOD = "cancel";
    /**
     * 取消方法
     */
    public static final String CANCEL_METHOD = "cancel";
    /**
     * 指令打印
     */
    public static final String CLOUD_PRINT_COMMAND = "printCommand";
    /**
     * 指令打印
     */
    public static final String INTERNATIONAL_SHIPMENT_URL = "http://api.kuaidi100.com/sendAssistant/order/apiCall";
}
