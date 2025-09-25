package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.AutoNumReq;
import com.kuaidi100.sdk.response.AutoNumResp;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

import java.util.List;

/**
 * 快递100智能判断接口（只提供给正式用户使用）
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 9:59
 */
public class AutoNum extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        AutoNumReq autoNumReq = (AutoNumReq) request;
        return String.format(ApiInfoConstant.AUTO_NUM_URL,autoNumReq.getNum(),autoNumReq.getKey());
    }

    /**
     * 根据单号获取快递公司列表
     *
     * @return
     */
    public List<AutoNumResp> getComByNumList(BaseRequest request) throws Exception{
        HttpResult httpResult = this.execute(request);
        if ( httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<List<AutoNumResp>>(){}.getType());
        }
        return null;
    }

    /**
     * 根据单号获取第一个快递公司
     *
     * @return
     */
    public String getFirstComByNum(BaseRequest request) throws Exception{
        List<AutoNumResp> comByNumList = this.getComByNumList(request);
        if (comByNumList != null && comByNumList.size()>0){
            return comByNumList.get(0).getComCode();
        }
        return null;
    }
}
