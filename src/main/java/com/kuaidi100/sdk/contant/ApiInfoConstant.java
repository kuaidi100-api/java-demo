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
    public static final String B_ORDER_OFFICIAL_PRICE_METHOD = "Price";
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
     * 指令打印方法
     */
    public static final String CLOUD_PRINT_COMMAND = "printCommand";
    /**
     * 指令打印
     */
    public static final String INTERNATIONAL_SHIPMENT_URL = "http://api.kuaidi100.com/sendAssistant/order/apiCall";
    /**
     * 订单导入授权url
     */
    public static final String THIRD_PLATFORM_ORDER_SHOP_AUTHORIZE_url = "https://api.kuaidi100.com/ent/shop/authorize";
    /**
     * 订单导入提交订单获取任务接口
     */
    public static final String THIRD_PLATFORM_ORDER_COMMIT_TASK = "https://api.kuaidi100.com/ent/order/task";
    /**
     * 订单导入提交订单回填单号
     */
    public static final String THIRD_PLATFORM_ORDER_UPLOAD_NUM = "https://api.kuaidi100.com/ent/logistics/send";
    /**
     * 发货单接口url
     */
    public static final String BILL_PARCELS_URL = "https://poll.kuaidi100.com/print/billparcels.do";
    /**
     * 发货单接口url
     */
    public static final String BILL_PARCELS_METHOD = "billparcels";
    /**
     * 第三方平台网点&面单余额接口url
     */
    public static final String THIRD_PLATFORM_REST = "getThirdInfo";
    /**
     * 快递面单OCR识别接口url
     */
    public static final String ELEC_DETOCR_URL = "http://api.kuaidi100.com/elec/detocr";
    /**
     * 新版编辑器请求地址
     */
    public static final String NEW_TEMPLATE_URL = "https://api.kuaidi100.com/label/order";
    /**
     * 下单
     */
    public static final String ORDER = "order";
    /**
     * 自定义
     */
    public static final String CUSTOM = "custom";
    /**
     * 快递预估时效
     */
    public static final String TIME = "time";
    /**
     * 详情
     */
    public static final String DETAIL = "detail";
    /**
     * 运单附件查询
     */
    public static final String BACKORDER = "backOrder";
    /**
     * 订单拦截
     */
    public static final String INTERCEPTORDER = "interceptOrder";
    /**
     * C端寄件下单接口请求地址
     */
    public static final String C_ORDER_URL = "https://order.kuaidi100.com/order/corderapi.do";
    /**
     * C端寄件下单接口方法
     */
    public static final String C_ORDER_METHOD = "cOrder";
    /**
     * C端寄件查价接口方法
     */
    public static final String C_ORDER_PRICE_METHOD = "price";
    /**
     * 可用性请求地址
     */
    public static final String REACHABLE_URL = "http://api.kuaidi100.com/reachable.do";
    /**
     * 可用性方法
     */
    public static final String REACHABLE_METHOD = "reachable";

    /**
     * 同城寄件请求地址
     */
    public static final String BSAMECITY_URL = "https://api.kuaidi100.com/bsamecity/order";
    /**
     * 同城寄件-预下单方法
     */
    public static final String BSAMECITY_PRICE = "price";
    /**
     * 同城寄件-下单方法
     */
    public static final String BSAMECITY_ORDER = "order";
    /**
     * 同城寄件-预取消方法
     */
    public static final String BSAMECITY_PRECANCEL = "precancel";
    /**
     * 同城寄件-取消方法
     */
    public static final String BSAMECITY_CANCEL = "cancel";
    /**
     * 同城寄件-加小费方法
     */
    public static final String BSAMECITY_ADDFEE = "addfee";
}
