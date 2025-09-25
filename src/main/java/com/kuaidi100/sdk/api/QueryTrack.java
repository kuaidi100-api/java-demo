package com.kuaidi100.sdk.api;

import com.google.gson.Gson;
import com.kuaidi100.sdk.core.BaseClient;
import com.kuaidi100.sdk.request.BaseRequest;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.QueryTrackReq;
import com.kuaidi100.sdk.response.QueryTrackResp;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpStatus;

/**
 * 实时查询
 *
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-14 16:27
 */
public  class QueryTrack extends BaseClient {

    @Override
    public String getApiUrl(BaseRequest request) {
        return ApiInfoConstant.QUERY_URL;
    }

    public QueryTrackResp queryTrack(QueryTrackReq queryTrackReq) throws Exception{
        HttpResult httpResult = execute(queryTrackReq);
        if (httpResult.getStatus() == HttpStatus.SC_OK && StringUtils.isNotBlank(httpResult.getBody())){
          return new Gson().fromJson(httpResult.getBody(),QueryTrackResp.class);
        }
        return null;
    }

}
