package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.response.AutoNumResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

/**
 * 快递100智能判断接口（只提供给正式用户使用）
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-17 9:59
 */
public class AutoNum {

    /**
     * 根据单号获取快递公司列表
     *
     * @param key 快递100分配的key
     * @param num 快递单号
     * @return
     */
    public List<AutoNumResp> getComByNumList(String key ,String num){
        String url = String.format(ApiInfoConstant.AUTO_NUM_URL,num,key);

        HttpResult httpResult = HttpUtils.doPost(url, null);
        if ( httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){
            return new Gson().fromJson(httpResult.getBody(),new TypeToken<List<AutoNumResp>>(){}.getType());
        }
        return null;
    }

    /**
     * 根据单号获取第一个快递公司
     *
     * @param key 快递100分配的key
     * @param num 快递单号
     * @return
     */
    public String getFirstComByNum(String key ,String num){
        List<AutoNumResp> comByNumList = this.getComByNumList(key, num);
        if (comByNumList != null && comByNumList.size()>0){
            return comByNumList.get(0).getComCode();
        }
        return null;
    }
}
