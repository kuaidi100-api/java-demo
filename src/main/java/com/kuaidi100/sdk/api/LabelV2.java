package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.response.backorder.BackOrderResp;
import com.kuaidi100.sdk.response.labelV2.OrderResult;
import com.kuaidi100.sdk.response.labelV2.Result;
import com.kuaidi100.sdk.response.labelV2.DeliveryTimeResp;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2022-06-27 15:46
 */
public class LabelV2 extends BaseClient {

    private String orderUrl;
    private String cancelUrl;
    private String timeUrl;
    private String reprintUrl;
    /**
     * 单一自定义地址（子账户单场景使用，如仅下单或仅取消）
     */
    private String customUrl;

    /**
     * 主账户模式，下单/取消/时效/复打均使用官方默认地址
     */
    public LabelV2() {
        this.orderUrl = ApiInfoConstant.NEW_TEMPLATE_URL;
        this.cancelUrl = ApiInfoConstant.NEW_TEMPLATE_URL;
        this.timeUrl = ApiInfoConstant.NEW_TEMPLATE_URL;
        this.reprintUrl = ApiInfoConstant.NEW_TEMPLATE_URL;
    }

    /**
     * 子账户模式（单场景），所有请求走同一自定义地址
     *
     * @param customUrl 子账户请求地址，如 {@link ApiInfoConstant#SUB_ELECTRONIC_ORDER_URL}
     */
    public LabelV2(String customUrl) {
        this.customUrl = customUrl;
    }

    /**
     * 子账户模式（多场景），按 method 路由到不同子账户地址
     *
     * @param orderUrl   下单地址，如 {@link ApiInfoConstant#SUB_ELECTRONIC_ORDER_URL}
     * @param cancelUrl  取消地址，如 {@link ApiInfoConstant#SUB_ELECTRONIC_CANCEL_URL}
     * @param timeUrl    时效预估地址，如 {@link ApiInfoConstant#SUB_TIME_URL}
     * @param reprintUrl 复打地址，如 {@link ApiInfoConstant#SUB_ELECTRONIC_REPRINT_URL}
     */
    public LabelV2(String orderUrl, String cancelUrl, String timeUrl, String reprintUrl) {
        this.orderUrl = orderUrl;
        this.cancelUrl = cancelUrl;
        this.timeUrl = timeUrl;
        this.reprintUrl = reprintUrl;
    }

    @Override
    public String getApiUrl(BaseRequest request) {
        if (StringUtils.isNotBlank(request.getUrl())) {
            return request.getUrl();
        }
        if (StringUtils.isNotBlank(this.customUrl)) {
            return this.customUrl;
        }
        if (request instanceof PrintReq) {
            String method = ((PrintReq) request).getMethod();
            if (ApiInfoConstant.ORDER.equals(method)) {
                return this.orderUrl;
            }
            if (ApiInfoConstant.CANCEL_METHOD.equals(method)) {
                return this.cancelUrl;
            }
            if (ApiInfoConstant.TIME.equals(method)) {
                return this.timeUrl;
            }
            if (ApiInfoConstant.CLOUD_PRINT_OLD_METHOD.equals(method)) {
                return this.reprintUrl;
            }
        }
        return this.orderUrl;
    }

    /**
     * 电子面单下单
     *
     * @param printReq
     * @author: api.kuaidi100.com
     * @time: 2020/7/17 17:15
     */
    public Result<OrderResult> order(PrintReq printReq) throws Exception {
        printReq.setMethod(ApiInfoConstant.ORDER);
        HttpResult httpResult = execute(printReq);

        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())) {
            return new Gson().fromJson(httpResult.getBody(), new TypeToken<Result<OrderResult>>() {
            }.getType());
        }
        return null;
    }

    /**
     * 电子面单复打
     *
     * @param printReq
     * @author: api.kuaidi100.com
     * @time: 2020/7/17 17:15
     */
    public Result repeatPrint(PrintReq printReq) throws Exception {
        printReq.setMethod(ApiInfoConstant.CLOUD_PRINT_OLD_METHOD);

        HttpResult httpResult = execute(printReq);

        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())) {
            return new Gson().fromJson(httpResult.getBody(), Result.class);
        }
        return null;
    }

    /**
     * 自定义打印
     *
     * @param printReq
     * @author: api.kuaidi100.com
     * @time: 2020/7/17 17:15
     */
    public Result<OrderResult> custom(PrintReq printReq) throws Exception {
        printReq.setMethod(ApiInfoConstant.CUSTOM);
        HttpResult httpResult = execute(printReq);

        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())) {
            return new Gson().fromJson(httpResult.getBody(), new TypeToken<Result<OrderResult>>() {
            }.getType());
        }
        return null;
    }


    /**
     * 快递预估时效查询
     * @param printReq
     * @return
     * @throws Exception
     */
    public Result<DeliveryTimeResp> deliveryTime(PrintReq printReq) throws Exception {
        printReq.setMethod(ApiInfoConstant.TIME);
        HttpResult httpResult = execute(printReq);

        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())) {
            return new Gson().fromJson(httpResult.getBody(), new TypeToken<Result<DeliveryTimeResp>>() {
            }.getType());
        }
        return null;
    }


    /**
     * 运单附件查询
     * @param printReq
     * @return
     * @throws Exception
     */
    public Result<BackOrderResp> backOrder(PrintReq printReq) throws Exception {
        printReq.setMethod(ApiInfoConstant.BACKORDER);
        HttpResult httpResult = execute(printReq);

        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())) {
            return new Gson().fromJson(httpResult.getBody(), new TypeToken<Result<DeliveryTimeResp>>() {
            }.getType());
        }
        return null;
    }

    /**
     * 订单拦截
     * @param printReq
     * @return
     * @throws Exception
     */
    public Result<BackOrderResp> interceptOrder(PrintReq printReq) throws Exception {
        printReq.setMethod(ApiInfoConstant.INTERCEPTORDER);
        HttpResult httpResult = execute(printReq);

        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())) {
            return new Gson().fromJson(httpResult.getBody(), new TypeToken<Result<DeliveryTimeResp>>() {
            }.getType());
        }
        return null;
    }
}
