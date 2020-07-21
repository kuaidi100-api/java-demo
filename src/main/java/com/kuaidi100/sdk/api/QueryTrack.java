package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.QueryTrackReq;
import com.kuaidi100.sdk.response.QueryTrackResp;
import com.kuaidi100.sdk.utils.HttpUtils;
import org.apache.commons.lang3.StringUtils;

/**
 * 实时查询
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-14 16:27
 */
public  class QueryTrack {


    public QueryTrackResp queryTrack(QueryTrackReq queryTrackReq) {
        QueryTrackResp queryTrackResp = new QueryTrackResp();
        if (queryTrackReq == null){
            return null;
        }

        HttpResult httpResult = HttpUtils.doPost(ApiInfoConstant.QUERY_URL, queryTrackReq);

        if (httpResult.getStatus() == 200 && StringUtils.isNotBlank(httpResult.getBody())){
           queryTrackResp = new Gson().fromJson(httpResult.getBody(),QueryTrackResp.class);
        }
        return queryTrackResp;
    }

}
