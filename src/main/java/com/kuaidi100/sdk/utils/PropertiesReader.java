package com.kuaidi100.sdk.utils;

import java.io.InputStream;
import java.util.Properties;

/**
 * 读取配置文件工具类
 *
 * @author api.kuaidi100.com
 * @date 2020年7月21日 15:40:11
 */
public class PropertiesReader {

    //创建Properties对象
    private static Properties property = new Properties();
    //在静态块中加载资源
    static {
        try  {
            InputStream in = PropertiesReader.class.getResourceAsStream("/account.properties");
            property.load(in);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 获取字符串类型的值
     * @param key
     * @return
     */
    public static String get(String key) {
        return property.getProperty(key);
    }

    /**
     * 获取Integer类型的值
     * @param key
     * @return
     */
    public static Integer getInteger(String key) {
        String value = get(key);
        return null == value ? null : Integer.valueOf(value);
    }

    /**
     * 获取Boolean类型的值
     * @param key
     * @return
     */
    public static Boolean getBoolean(String key) {
        String value = get(key);
        return null == value ? null : Boolean.valueOf(value);
    }

    /**
     * 设置一个键值对
     * @param key
     * @param value
     */
    public static void set(String key,String value){
        property.setProperty(key,value);
    }

    /**
     * 添加一个键值对
     * @param key
     * @param value
     */
    public static void add(String key,Object value){
        property.put(key,value);
    }
}

