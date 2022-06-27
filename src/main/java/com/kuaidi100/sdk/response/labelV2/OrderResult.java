package com.kuaidi100.sdk.response.labelV2;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * @Author: ligl
 * @Date: 2022-05-05 15:46
 */
@Data
public class OrderResult {
    /**
     * 快递单号
     */
    private String kuaidinum;
    /**
     * 回单号
     */
    private String returnNum;
    /**
     * 子单号，多个使用,隔开
     */
    private String childNum;
    /**
     * 面单短链，printType为IMAGE或者HTML时的面单短链
     */
    private String label;
    /**
     * 任务ID
     */
    private String taskId;

    //以下为快递公司面单所需的面单参数，非标准参数，不是每个快递公司都返回，也不是每个快递公司都叫这个名词，仅供参考
    /**
     * 大头笔
     */
    private String bulkpen;
    /**
     * 始发地区域编码
     */
    private String orgCode;
    /**
     * 始发地/始发网点名称
     */
    private String orgName;
    /**
     * 目的地区域编码
     */
    private String destCode;
    /**
     * 目的地/到达网点
     */
    private String destName;
    /**
     * 始发分拣编码
     */
    private String orgSortingCode;
    /**
     * 始发分拣名称
     */
    private String orgSortingName;
    /**
     * 目的分栋编码
     */
    private String destSortingCode;
    /**
     * 目的分栋中心名称
     */
    private String destSortingName;
    /**
     * 始发其他信息
     */
    private String orgExtra;
    /**
     * 目的其他信息
     */
    private String destExtra;
    /**
     * 集包编码
     */
    private String pkgCode;
    /**
     * 集包地名称
     */
    private String pkgName;
    /**
     * 二维码
     */
    private String qrCode;
    /**
     * 快递公司订单号
     */
    private String kdComOrderNum;
    /**
     * 快递业务类型编码
     */
    private String expressCode;
    /**
     * 快递业务类型名称
     */
    private String expressName;
    /**
     * 路区
     */
    private String road;
    private String agingName;
    private String checkMan;
    private String collection;
    private String payaccount;
    private String waterMark;
    private String printData;
    private String printDatas;
    private String sameCity;
    private String sameProv;
    private String openid;
    private String expressType;
    private String packageNumAndCount;
    private String packageType;
    private String routeCity0;
    private String routeCity1;
    private String routeCity2;
    private String routeCity3;
    private String routeCity4;
    private String backSign;
    private String collectionSign;
    private String deliveryType;

    private String twoDimensionCode;
    private String codingMappingOut;
    private String sfSimpleCode;
    private String fwSimpleCode;
    private String fwOutbound;
    private String codingMapping;
    private String agingNameUrl;
    private String proName;
    private String abFlag;
    private String abFlagUrl;
    private String printIcon;
    private String printIconUrl;
    private String destRouteLabel;
    private String xbFlag;
    private String xbFlagUrl;
    private String collectionUrl;

    private String net;

    private String kuaishou_signature;
    private String kuaishou_key;
    private Map<String,String> backTemplate;
    private List<Map<String,String>> childInfo;
}
