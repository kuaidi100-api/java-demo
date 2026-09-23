package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.AutoNumReq;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.response.AutoNumResp;
import com.kuaidi100.sdk.response.PrintBaseResp;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

import java.util.List;

/**
 * 快递100智能判断接口（只提供给正式用户使用）
 * <p>
 * 成功响应为数组，失败响应为对象（含 returnCode / message / result）。
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 9:59
 */
public class AutoNum extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        AutoNumReq autoNumReq = (AutoNumReq) request;
        return String.format(ApiInfoConstant.AUTO_NUM_URL, autoNumReq.getNum(), autoNumReq.getKey());
    }

    /**
     * 根据单号获取快递公司列表
     *
     * @param request 智能单号识别请求
     * @return 快递公司列表；HTTP 非成功或 body 为空时返回 null
     * @throws Exception 业务失败（错误对象）或响应格式异常时抛出，异常信息包含 returnCode、message
     */
    public List<AutoNumResp> getComByNumList(BaseRequest request) throws Exception {
        HttpResult httpResult = this.execute(request);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())) {
            String body = httpResult.getBody();
            JsonElement jsonElement = JsonParser.parseString(body);
            if (jsonElement.isJsonArray()) {
                return new Gson().fromJson(jsonElement, new TypeToken<List<AutoNumResp>>() {
                }.getType());
            }
            if (jsonElement.isJsonObject()) {
                PrintBaseResp errorResp = new Gson().fromJson(jsonElement, PrintBaseResp.class);
                String returnCode = errorResp != null ? errorResp.getReturnCode() : null;
                String message = errorResp != null ? errorResp.getMessage() : body;
                throw new Exception(String.format(
                        "智能单号识别失败，returnCode=%s，message=%s", returnCode, message));
            }
            throw new Exception("智能单号识别失败，响应格式无法解析：" + body);
        }
        return null;
    }

    /**
     * 根据单号获取第一个快递公司编码
     *
     * @param request 智能单号识别请求
     * @return 第一个快递公司编码；无结果时返回 null
     * @throws Exception 同 {@link #getComByNumList(BaseRequest)}
     */
    public String getFirstComByNum(BaseRequest request) throws Exception {
        List<AutoNumResp> comByNumList = this.getComByNumList(request);
        if (comByNumList != null && comByNumList.size() > 0) {
            return comByNumList.get(0).getComCode();
        }
        return null;
    }
}
