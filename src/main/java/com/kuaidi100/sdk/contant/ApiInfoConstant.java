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
     * 订阅url
     */
    public static final String SUBSCRIBE_URL = "https://poll.kuaidi100.com/poll";
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
}
