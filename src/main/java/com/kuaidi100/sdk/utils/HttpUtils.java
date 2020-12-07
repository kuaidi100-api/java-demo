package com.kuaidi100.sdk.utils;

import com.kuaidi100.sdk.pojo.HttpResult;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-14 16:59
 */
public class HttpUtils {

    private final static String CHARSET_DEFAULT = "UTF-8";
    private static Logger record = LoggerFactory.getLogger("record");
    private static Boolean isRecord = PropertiesReader.getBoolean("log.return.record");

    /**
     * post请求  编码格式默认UTF-8
     *
     * @param url     请求url
     * @return
     */
    public static HttpResult doPost(String url,  Object obj) {
        CloseableHttpClient httpClient = HttpClientBuilder.create().build();
        CloseableHttpResponse resp = null;

        HttpResult result = new HttpResult();
        try {
            Map<String, String> params = ObjectToMapUtils.objectToMap(obj);
            HttpPost httpPost = new HttpPost(url);
            if (params != null && params.size() > 0) {
                List<NameValuePair> list = new ArrayList<NameValuePair>();
                for (Map.Entry<String, String> entry : params.entrySet()) {
                    list.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
                }
                httpPost.setEntity(new UrlEncodedFormEntity(list, CHARSET_DEFAULT));
            }

            resp = httpClient.execute(httpPost);
            String body = EntityUtils.toString(resp.getEntity(), CHARSET_DEFAULT);
            int statusCode = resp.getStatusLine().getStatusCode();
            result.setStatus(statusCode);
            result.setBody(body);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (null != resp) {
                try {
                    resp.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return result;
    }

    /**
     * post请求  编码格式默认UTF-8
     *
     * @param url     请求url
     * @return
     */
    public static HttpResult doPostFile(String url,  File file) {
        CloseableHttpClient httpClient = HttpClientBuilder.create().build();
        CloseableHttpResponse resp = null;

        HttpResult result = new HttpResult();
        try {

            HttpPost httpPost = new HttpPost(url);
            MultipartEntityBuilder builder = MultipartEntityBuilder.create();
            // 把文件加到HTTP的post请求中
            builder.addBinaryBody(
                    "file",
                    new FileInputStream(file),
                    ContentType.MULTIPART_FORM_DATA,
                    file.getName()
            );
            //HttpEntity
            HttpEntity entity = builder.build();
            httpPost.setEntity(entity);
            resp = httpClient.execute(httpPost);
            result.setStatus(resp.getStatusLine().getStatusCode());
            result.setBody(EntityUtils.toString(resp.getEntity(), CHARSET_DEFAULT));
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (null != resp) {
                try {
                    resp.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return result;
    }

}
