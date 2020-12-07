package com.kuaidi100.sdk.utils;

import java.lang.reflect.Field;
import java.util.*;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-12-01 9:19
 */
public class ObjectToMapUtils {
    /**
     * 将Object对象里面的属性和值转化成Map对象
     *
     * @param obj
     * @return
     * @throws IllegalAccessException
     */
    public static Map<String, String> objectToMap(Object obj) throws IllegalAccessException {
        if (obj == null) {
            return null;
        }
        Map<String, String> map = new HashMap<String,String>();
        List<Field> allField = getAllField(obj);
        for (Field field : allField) {
            field.setAccessible(true);
            String fieldName = field.getName();
            String fieldValue = "";
            if (field.getType()== String.class || field.getType() == Integer.class || field.getType() == int.class){
                fieldValue = field.get(obj)==null?"": field.get(obj).toString();
            }
            map.put(fieldName, fieldValue);
        }
        return map;
    }

    private static List<Field> getAllField(Object obj){
        List<Field> fieldList = new ArrayList<Field>() ;
        Class<?> clazz = obj.getClass();
        while (clazz != null){
            fieldList.addAll(Arrays.asList(clazz.getDeclaredFields()));
            clazz = clazz.getSuperclass();
        }
        return fieldList;

    }
}
