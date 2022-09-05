import com.google.gson.Gson;
import com.kuaidi100.sdk.api.InternationalShipment;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.request.PrintReq;
import com.kuaidi100.sdk.request.internationalshipment.*;
import com.kuaidi100.sdk.utils.SignUtils;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

/**
 * 国际下单测试类
 *
 * @Author: ligl
 * @Date: 2021-12-13 15:24
 */
public class InternationalShipmentTest  extends BaseServiceTest{

    /**
     * 国际电子面单下单API
     *
     * @throws Exception
     */
    @Test
    public void testShipment() throws Exception {
        ShipmentReq shipmentReq = new ShipmentReq();
        shipmentReq.setPartnerId("");
        shipmentReq.setPartnerKey("");
        shipmentReq.setPartnerSecret("");
        shipmentReq.setCode("");
        shipmentReq.setKuaidicom("fedex");
        shipmentReq.setCargo("invoice");
        shipmentReq.setExpType("FedEx International First®");
        shipmentReq.setUnitOfMeasurement("SU");
        shipmentReq.setWeight(50.00);
        shipmentReq.setCustomsValue(1000.00);

        ManInfo sendMan = new ManInfo();
        sendMan.setName("test");
        sendMan.setMobile("16888888888");
        sendMan.setCountryCode("CN");
        sendMan.setCity("SHENZHEN");
        sendMan.setAddr("Kingdee Software Park");
        sendMan.setDistrict("Hi-tech Park,Nanshang District");
        sendMan.setZipcode("518057");
        sendMan.setEmail("test@qq.com");
        shipmentReq.setSendMan(sendMan);

        ManInfo recMan = new ManInfo();
        recMan.setName("test");
        recMan.setMobile("16888888888");
        recMan.setCountryCode("US");
        recMan.setCity("NEW YORK");
        recMan.setAddr(" 70 Washington Square South");
        recMan.setZipcode("10012");
        recMan.setEmail("test@qq.com");
        recMan.setStateOrProvinceCode("NY");
        shipmentReq.setRecMan(recMan);

        List<PackageInfo> packageInfoList = new ArrayList<>();
        PackageInfo packageInfo = new PackageInfo();
        packageInfo.setLength(10.00);
        packageInfo.setWidth(20.00);
        packageInfo.setHeight(10.00);
        packageInfo.setWeight(50.00);
        packageInfoList.add(packageInfo);
        shipmentReq.setPackageInfos(packageInfoList);

        List<ExportInfo> exportInfoList = new ArrayList<>();
        ExportInfo exportInfo = new ExportInfo();
        exportInfo.setDesc("test");
        exportInfo.setGrossWeight(50.00);
        exportInfo.setQuantity(1);
        exportInfo.setUnitPrice(1000.00);
        exportInfo.setQuantityUnitOfMeasurement("PCS");
        exportInfo.setManufacturingCountryCode("CN");
        exportInfoList.add(exportInfo);
        shipmentReq.setExportInfos(exportInfoList);

        CustomsClearance customsClearance = new CustomsClearance();
        customsClearance.setPurpose("GIFT");
        customsClearance.setDocument(true);

        String param = new Gson().toJson(shipmentReq);
        String t = System.currentTimeMillis() + "";
        String sign = SignUtils.printSign(param,t,key,secret);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.ELECTRONIC_ORDER_PIC_METHOD);
        printReq.setSign(sign);
        printReq.setParam(param);
        printReq.setT(t);

        IBaseClient baseClient = new InternationalShipment();
        //国际面单耗时比较长，尽量调整10s以上
        baseClient.setTimeOut(1000,10000);
        System.out.println(baseClient.execute(printReq));
    }
}
