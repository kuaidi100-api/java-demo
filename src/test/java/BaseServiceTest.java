import com.google.gson.Gson;
import com.kuaidi100.sdk.api.*;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.contant.CompanyConstant;
import com.kuaidi100.sdk.contant.PrintType;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.pojo.HttpResult;
import com.kuaidi100.sdk.request.*;
import com.kuaidi100.sdk.request.addressResolution.AddressResolutionParam;
import com.kuaidi100.sdk.request.bsamecity.BsamecityAddfeeReq;
import com.kuaidi100.sdk.request.bsamecity.BsamecityCancelReq;
import com.kuaidi100.sdk.request.bsamecity.BsamecityOrderReq;
import com.kuaidi100.sdk.request.bsamecity.Goods;
import com.kuaidi100.sdk.request.intAddressResolution.IntAddressResolutionParam;
import com.kuaidi100.sdk.request.labelV2.*;
import com.kuaidi100.sdk.response.QueryTrackMapResp;
import com.kuaidi100.sdk.utils.PropertiesReader;
import com.kuaidi100.sdk.utils.SignUtils;
import org.junit.Test;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * @Author: api.kuaidi100.com
 * @Date: 2020-07-15 16:20
 */
public class BaseServiceTest {

    String key = PropertiesReader.get("key");
    String customer = PropertiesReader.get("customer");
    String secret = PropertiesReader.get("secret");
    String siid = PropertiesReader.get("siid");
    String userid = PropertiesReader.get("userid");
    String tid = PropertiesReader.get("tid");
    String secret_key = PropertiesReader.get("secret_key");
    String secret_secret = PropertiesReader.get("secret_secret");
    /**
     * 实时快递查询接口
     */
    @Test
    public void testQueryTrack() throws Exception{

        QueryTrackReq queryTrackReq = new QueryTrackReq();
        QueryTrackParam queryTrackParam = new QueryTrackParam();
        queryTrackParam.setCom(CompanyConstant.YT);
        queryTrackParam.setNum("YT9383342193097");
        queryTrackParam.setPhone("17725390266");
        String param = new Gson().toJson(queryTrackParam);

        queryTrackReq.setParam(param);
        queryTrackReq.setCustomer(customer);
        queryTrackReq.setSign(SignUtils.querySign(param ,key,customer));

        IBaseClient baseClient = new QueryTrack();
        System.out.println(baseClient.execute(queryTrackReq));
    }

    /**
     * 快递查询地图轨迹
     */
    @Test
    public void testQueryMapView() throws Exception{

        QueryTrackReq queryTrackReq = new QueryTrackReq();
        QueryTrackParam queryTrackParam = new QueryTrackParam();
        queryTrackParam.setCom(CompanyConstant.YD);
        queryTrackParam.setNum("4311159956248");
        queryTrackParam.setPhone("17725390266");
        queryTrackParam.setFrom("河北保定市");
        queryTrackParam.setTo("湖南岳阳市");
        queryTrackParam.setResultv2("2");
        String param = new Gson().toJson(queryTrackParam);

        queryTrackReq.setParam(param);
        queryTrackReq.setCustomer(customer);
        queryTrackReq.setSign(SignUtils.querySign(param ,key,customer));

        IBaseClient baseClient = new QueryTrackMap();
        HttpResult result = baseClient.execute(queryTrackReq);

        QueryTrackMapResp queryTrackMapResp = new Gson().fromJson(result.getBody(),QueryTrackMapResp.class);
        System.out.println(queryTrackMapResp);
    }

    /**
     * 订阅接口
     */
    @Test
    public void testSubscribe() throws Exception{

        String data = "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600239259,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92106,18339273118,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281009121397,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=91175,13750812761,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281455920505,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=91831,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281455963192,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=91787,15577227112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288369416338,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=89132,18937182002,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288207493489,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=87543,18312669840,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF2084062704430,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86283,13733152848,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3232498980986,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=84650,13700875082,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3237980824303,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=80573,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3239476355586,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=78235,13880622172,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600200967,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92213,13733152848,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600203430,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92193,18337191975,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF2074154248196,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92136,15301481691,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600251646,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92096,18522587153,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600898503,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92084,13783507691,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3237987766891,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=80826,19943803288,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3286221747423,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=81719,15371999740,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3232170789893,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=83481,13880622172,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3232170712064,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=83545,13383829822,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3232174483598,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=83727,18939563166,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3237316791330,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=79889,19943803298,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281453496318,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=91777,13880622172,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3284187125250,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=79179,18312669840,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3284183845835,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=79542,13837140101,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297723964262,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90960,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288765758082,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86679,13756566272,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3239476355586,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=78184,18937182002,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3282352414250,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=85654,19937779664,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238639264281,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=88631,15837117698,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288302781640,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=88924,13783507691,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3237694938724,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=79805,18937182002,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238615369562,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=88520,15577227112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234518946621,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=85302,13880622172,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF2074154248187,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92136,15301481691,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600285853,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92130,13783507691,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281216470444,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92083,13837140101,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297728540612,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90956,15577227112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238236636706,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90877,15371999740,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234120453760,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86336,13837140101,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234120437136,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86275,15837117698,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234120414110,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86255,18939502112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288308170669,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=89009,19943803298,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288763593578,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86591,13837140101,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3282149259934,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=85105,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF2054080346277,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92130,13783507691,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3239476687643,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=78179,18312669840,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288901004900,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86880,18939563166,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3284080262528,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=77634,19943803298,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3286251606365,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=82124,18939502112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3237301501050,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=80135,17788141112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3237694953409,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=79736,13880622172,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3237694953409,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=79710,13880622172,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234080237206,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=87141,18959222080,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238249011596,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=91300,18937182002,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600292321,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92219,18939563166,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238631176728,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=88237,15301481691,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238661496632,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=88600,18337191975,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281983496340,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90880,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288768235528,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86283,13733152848,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3286250697575,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=81753,15577227112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288721155930,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86811,15378703883,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3237694938724,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=79804,19937770084,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234518946621,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=85028,18937182002,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281216931412,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92232,18339273118,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281216950006,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92231,18337191975,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281216002224,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92188,15837117698,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3286590038241,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=83400,13837140101,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234510206080,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=84974,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3232598114664,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=82756,15353618250,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3282149858269,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=85338,13383829822,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3232496096005,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=84512,18337191975,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3282482124986,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=84063,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3284876592534,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=78966,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238936322747,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90208,15577227112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234147919817,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86663,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234120285615,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86334,18611733101,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600273507,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92220,15837117698,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF2054080343680,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92188,15837117698,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600257006,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92097,18037877058,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3239476367126,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=78177,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234120224998,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86326,15038378799,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288768899318,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86175,13880622172,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234073356761,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86815,17788141112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3286559742699,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=83634,15577227112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297728508511,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90950,15378703883,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238268351766,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90918,18939502112,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281983496340,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90728,18312669840,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3239268530088,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=77682,18937182002,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238961355409,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=89853,18937182002,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288726483877,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86311,18937182002,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3282149259934,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=85112,18312669840,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF2054080343671,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92188,15837117698,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281216067212,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92136,15301481691,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3281216032027,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92093,13375550311,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297600897139,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=92085,18939563166,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288995919407,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=87144,19943803298,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288942730992,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=87202,18337191975,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3286678796967,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=81211,17788141115,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3288720504265,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86681,19943803298,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3286250697575,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=81834,19943803288,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297728545402,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90916,13526584569,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238268367571,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90899,15378703883,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238268333585,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90772,19943803298,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3297723964262,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90967,18312669840,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3237694938724,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=79156,18937182002,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3238964610192,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=90240,18312669840,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3234128969163,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86256,13880622172,4\n" +
                "shunfeng,河南郑州市中原区,grmFRRHA6201,SF3286182520665,https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=82692,18192651175,4\n";

        for (String s : data.split("\n")) {
            String[] split = s.split(",");

            String company = split[0];
            String from = split[1];
            String key = split[2];
            String number = split[3];
            String callbackurl = split[4];
            String phone = split[5];
            String resultv2 = split[6];

            SubscribeParameters subscribeParameters = new SubscribeParameters();
            subscribeParameters.setCallbackurl(callbackurl);
            subscribeParameters.setPhone(phone);
            subscribeParameters.setResultv2(resultv2);

            SubscribeParam subscribeParam = new SubscribeParam();
            subscribeParam.setParameters(subscribeParameters);
            subscribeParam.setCompany(company);
            subscribeParam.setNumber(number);
            subscribeParam.setKey(key);
            subscribeParam.setFrom(from);
//            subscribeParam.setTo(to);

            SubscribeReq subscribeReq = new SubscribeReq();
            subscribeReq.setSchema(ApiInfoConstant.SUBSCRIBE_SCHEMA);
            subscribeReq.setParam(new Gson().toJson(subscribeParam));

            IBaseClient subscribe = new Subscribe();
            System.out.println(subscribe.execute(subscribeReq));


        }

//        SubscribeParameters subscribeParameters = new SubscribeParameters();
//        subscribeParameters.setCallbackurl("https://api.kuaidi100.com/eorder/logistics/monitor/rec/trajectory?userId=850332023&orderId=86175");
//        subscribeParameters.setPhone("13880622172");
//        subscribeParameters.setResultv2("4");
//
//        SubscribeParam subscribeParam = new SubscribeParam();
//        subscribeParam.setParameters(subscribeParameters);
//        subscribeParam.setCompany(CompanyConstant.SF);
//        subscribeParam.setNumber("SF3288768899318");
//        subscribeParam.setKey(key);
//        subscribeParam.setFrom("河南郑州市中原区");
//        subscribeParam.setTo("四川成都市双流区");
//
//        SubscribeReq subscribeReq = new SubscribeReq();
//        subscribeReq.setSchema(ApiInfoConstant.SUBSCRIBE_SCHEMA);
//        subscribeReq.setParam(new Gson().toJson(subscribeParam));
//
//        IBaseClient subscribe = new Subscribe();
//        System.out.println(subscribe.execute(subscribeReq));
    }

    /**
     * 智能识别接口（正式用户可以使用）
     */
    @Test
    public void testAutoNum() throws Exception{
        AutoNumReq autoNumReq = new AutoNumReq();
        autoNumReq.setKey(key);
        autoNumReq.setNum("773039762404825");

        IBaseClient baseClient = new AutoNum();
        System.out.println(baseClient.execute(autoNumReq));
    }

    /**
     * 电子面单下单接口(V2)
     *
     * @throws Exception
     */
    @Test
    public void  testLabelOrder() throws Exception {

        ManInfo recManInfo  = new ManInfo();
        recManInfo.setName("张三");
        recManInfo.setMobile("15999566666");
        recManInfo.setPrintAddr("广东省深圳市南山区科技南十二路");

        ManInfo sendManInfo = new ManInfo();
        sendManInfo.setName("李四");
        sendManInfo.setMobile("15999566666");
        sendManInfo.setPrintAddr("北京市海淀区xxx路");

        OrderReq orderReq = new OrderReq();
        orderReq.setKuaidicom(CompanyConstant.ZJS);
        orderReq.setCount(1);
        orderReq.setSiid(siid);
        orderReq.setTempId("60f6c17c7c223700131d8bc3");
        orderReq.setSendMan(sendManInfo);
        orderReq.setRecMan(recManInfo);

        orderReq.setPrintType(PrintType.CLOUD);

        String param = new Gson().toJson(orderReq);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.ORDER);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));

    }


    /**
     * 运单附件查询接口
     *
     * @throws Exception
     */
    @Test
    public void  testBackOrder() throws Exception {
        BackOrderReq backOrderReq = new BackOrderReq();
        backOrderReq.setPartnerId("12345678910");
        backOrderReq.setPartnerKey("12345678910");
        backOrderReq.setKuaidicom(CompanyConstant.SF);
        backOrderReq.setKuaidinum("SF1234567");
        backOrderReq.setPhone("13088888888");
        String param = new Gson().toJson(backOrderReq);
        String t = System.currentTimeMillis() + "";
        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.BACKORDER);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));

    }

    /**
     * 订单拦截接口
     *
     * @throws Exception
     */
    @Test
    public void  testInterceptOrder() throws Exception {
        InterceptOrderReq interceptOrderReq = new InterceptOrderReq();
        interceptOrderReq.setOrderId("123456789");
        interceptOrderReq.setKuaidicom(CompanyConstant.JT);
        interceptOrderReq.setKuaidinum("JT12345678");
        interceptOrderReq.setPartnerId("12345678");
        interceptOrderReq.setPartnerKey("12345678");
        interceptOrderReq.setReason("测试拦截");
        interceptOrderReq.setInterceptType("MODIFY_ADDR");
        ManInfo recManInfo = new ManInfo();
        recManInfo.setName("张三");
        recManInfo.setMobile("130******66");
        recManInfo.setPrintAddr("广东省深圳市南山区粤海街道科技南十二路金蝶软件园");
        interceptOrderReq.setRecManInfo(recManInfo);
        interceptOrderReq.setOrderRole("1");
        interceptOrderReq.setInterceptPayType("THIRDPARTY");
        interceptOrderReq.setSalt("kuaidi1000api@salt");
        interceptOrderReq.setCallbackUrl("http://api.kuaidi100.com/test/callback");
        String param = new Gson().toJson(interceptOrderReq);
        String t = System.currentTimeMillis() + "";
        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.INTERCEPTORDER);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));

    }

    /**
     * 地址解析接口
     *
     * @throws Exception
     */
    @Test
    public void  testAddressResolution() throws Exception {
        AddressResolutionParam addressResolutionParam = new AddressResolutionParam();
        // content 、image、imageUrl、pdfUrl、htmlUrl必填其一，优先顺序：content >image>imageUrl>padUrl>htmlUrl
        addressResolutionParam.setContent("张三广东省深圳市南山区粤海街道科技南十二路金蝶软件园13088888888");
        // image传base64编码
        // addressResolutionParam.setImage("");
        // addressResolutionParam.setImageUrl("http://api.kuaidi100.com/label/getImage/20240621/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        // addressResolutionParam.setPdfUrl("http://api.kuaidi100.com/label/xxx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        // addressResolutionParam.setHtmlUrl("http://api.kuaidi100.com/label/xxx/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
        String param = new Gson().toJson(addressResolutionParam);
        String t = System.currentTimeMillis() + "";
        AddressResolutionReq addressResolutionReq = new AddressResolutionReq();
        addressResolutionReq.setT(t);
        addressResolutionReq.setKey(key);
        addressResolutionReq.setSign(SignUtils.printSign(param,t,key,secret));
        addressResolutionReq.setParam(param);
        IBaseClient baseClient = new AddressResolution();
        System.out.println(baseClient.execute(addressResolutionReq));
    }

    /**
     * 国际地址解析接口
     *
     * @throws Exception
     */
    @Test
    public void  testIntAddressResolution() throws Exception {
        IntAddressResolutionParam intAddressResolutionParam = new IntAddressResolutionParam();
        intAddressResolutionParam.setCode("US");
        intAddressResolutionParam.setAddress("5430 Fredericksburg Rd Ste 310 San Antonio TX 78229 USA");
        intAddressResolutionParam.setLanguage("zh");
        String param = new Gson().toJson(intAddressResolutionParam);
        String t = System.currentTimeMillis() + "";
        AddressResolutionReq req = new AddressResolutionReq();
        req.setT(t);
        req.setKey(key);
        req.setSign(SignUtils.printSign(param,t,key,secret));
        req.setParam(param);
        IBaseClient baseClient = new IntAddressResolution();
        System.out.println(baseClient.execute(req));
    }


    /**
     * 云打印复打(V2)
     *
     * @throws Exception
     */
    @Test
    public void  testPrintOld() throws Exception {
        RepeatPrintReq repeatPrintReq = new RepeatPrintReq();

        repeatPrintReq.setTaskId("027B34AD22DE4F299643A13642B70D5F");

        String param = new Gson().toJson(repeatPrintReq);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.CLOUD_PRINT_OLD_METHOD);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 自定义打印(V2)
     *
     * @throws Exception
     */
    @Test
    public void  testCustom() throws Exception {
        CustomReq customReq = new CustomReq();

        customReq.setPrintType(PrintType.IMAGE);
        customReq.setTempId("41b9d19ee56b45b5a23d7b6ace4f9029");

        Map<String,Object> customParam = new HashMap<String,Object>();
        customParam.put("qrcode","888888888");
        customReq.setCustomParam(customParam);

        String param = new Gson().toJson(customReq);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.CUSTOM);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 电子面单取消（V2）
     * @throws Exception
     */
    @Test
    public void testLabelCancel() throws Exception{
        LabelCancelParam labelCancelParam = new LabelCancelParam();
        labelCancelParam.setPartnerId("test");
        labelCancelParam.setKuaidicom(CompanyConstant.SF);
        labelCancelParam.setKuaidinum("SF1342567604302");
        //快递公司订单号(对应下单时返回的kdComOrderNum，如果没有可以不传，否则必传)
        labelCancelParam.setOrderId("01639366271685GNkZEX");
        //业务员编码，部分快递公司必填
        labelCancelParam.setCheckMan("123");
        //产品业务类型，部分快递公司必填
        labelCancelParam.setExpType("标准快递");

        labelCancelParam.setReason("暂时不寄了");
        String param = new Gson().toJson(labelCancelParam);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.CANCEL_METHOD);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 快递预估时效
     *
     * @throws Exception
     */
    @Test
    public void  testDeliveryTime() throws Exception {
        DeliveryTimeReq deliveryTimeReq = new DeliveryTimeReq();
        deliveryTimeReq.setKuaidicom("jd");
        deliveryTimeReq.setFrom("广东省广州市白云区");
        deliveryTimeReq.setTo("广东省深圳市南山区");
        deliveryTimeReq.setOrderTime("2023-10-11 10:00:00");
        deliveryTimeReq.setExpType("特惠送");


        String param = new Gson().toJson(deliveryTimeReq);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setMethod(ApiInfoConstant.TIME);
        printReq.setParam(param);

        IBaseClient baseClient = new LabelV2();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 电子面单图片接口(v1版本示例，后续不维护新功能，建议使用v2)
     */
    @Test
    public void testPrintImg() throws Exception{
        PrintImgParam printImgParam = new PrintImgParam();
        printImgParam.setKuaidicom(CompanyConstant.ZJS);
        printImgParam.setSendManName("张三");
        printImgParam.setSendManMobile("15999566666");
        printImgParam.setSendManPrintAddr("广东省深圳市南山区科技南十二路");
        printImgParam.setRecManName("李四");
        printImgParam.setRecManMobile("15999566666");
        printImgParam.setRecManPrintAddr("北京市海淀区xxx路");
        printImgParam.setType("10");
        printImgParam.setTempid("180c7c8f646742ca871a92c976392b05");
        printImgParam.setCount("1");

        String param = new Gson().toJson(printImgParam);
        String t = System.currentTimeMillis() + "";
        String sign = SignUtils.printSign(param,t,key,secret);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.ELECTRONIC_ORDER_PIC_METHOD);
        printReq.setSign(sign);
        printReq.setParam(param);
        printReq.setT(t);

        IBaseClient printImg = new PrintImg();
        System.out.println(printImg.execute(printReq));
    }

    /**
     * 电子面单HTML接口(v1版本示例，后续不维护新功能，建议使用v2)
     */
    @Test
    public void testPrintHtml() throws Exception{
        ManInfo recManInfo  = new ManInfo();
        recManInfo.setName("张三");
        recManInfo.setMobile("15999566666");
        recManInfo.setPrintAddr("广东省深圳市南山区科技南十二路");

        ManInfo sendManInfo = new ManInfo();
        sendManInfo.setName("李四");
        sendManInfo.setMobile("15999566666");
        sendManInfo.setPrintAddr("北京市海淀区xxx路");

        PrintHtmlParam printHtmlParam = new PrintHtmlParam();
        printHtmlParam.setKuaidicom(CompanyConstant.ZJS);
        printHtmlParam.setCount("2");
        printHtmlParam.setNeedChild("1");
        //如果需要返回电子面单，需要设置
        printHtmlParam.setNeedTemplate("1");
        printHtmlParam.setSendMan(sendManInfo);
        printHtmlParam.setRecMan(recManInfo);

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(printHtmlParam);
        String sign = SignUtils.printSign(param,t,key,secret);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.ELECTRONIC_ORDER_HTML_METHOD);
        printReq.setT(t);
        printReq.setSign(sign);
        printReq.setParam(param);

        IBaseClient printHtml = new PrintHtml();
        System.out.println(printHtml.execute(printReq));
    }

    /**
     * 电子面单打印接口(v1版本示例，后续不维护新功能，建议使用v2)
     */
    @Test
    public void testPrintCloud() throws Exception{
        ManInfo recManInfo  = new ManInfo();
        recManInfo.setName("张三");
        recManInfo.setMobile("15999566666");
        recManInfo.setPrintAddr("广东省深圳市南山区科技南十二路");

        ManInfo sendManInfo = new ManInfo();
        sendManInfo.setName("李四");
        sendManInfo.setMobile("15999566666");
        sendManInfo.setPrintAddr("北京市海淀区xxx路");

        PrintCloudParam printCloudParam = new PrintCloudParam();
        printCloudParam.setKuaidicom(CompanyConstant.ZJS);
        printCloudParam.setCount("1");
        printCloudParam.setSiid(siid);
        printCloudParam.setTempid("180c7c8f646742ca871a92c976392b05");
        printCloudParam.setSendMan(sendManInfo);
        printCloudParam.setRecMan(recManInfo);

        String param = new Gson().toJson(printCloudParam);
        String t = System.currentTimeMillis() + "";

        PrintReq printReq = new PrintReq();
        printReq.setT(t);
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.ELECTRONIC_ORDER_PRINT_METHOD);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient baseClient = new PrintCloud();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 云打印自定义(v1版本示例，后续不维护新功能，建议使用v2)
     */
    @Test
    public void testCloudCustom() throws Exception{
        CloudPrintCustomParam cloudPrintCustomParam = new CloudPrintCustomParam();
        cloudPrintCustomParam.setSiid(siid);
        cloudPrintCustomParam.setCallBackUrl("http://www.baidu.com");
        cloudPrintCustomParam.setTempid("180c7c8f646742ca871a92c976392b05");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(cloudPrintCustomParam);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.CLOUD_PRINT_CUSTOM_METHOD);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient baseClient = new CloudPrintCustom();
        System.out.println(baseClient.execute(printReq));
    }

    /**
     * 附件打印接口
     */
    @Test
    public void testCloudAttachment() throws Exception{
        CloudPrintAttachmentParam cloudPrintAttachmentParam = new CloudPrintAttachmentParam();
        cloudPrintAttachmentParam.setSiid(siid);
        cloudPrintAttachmentParam.setCallBackUrl("http://www.baidu.com");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(cloudPrintAttachmentParam);
        CloudAttachmentReq cloudPrintAttachmentReq = new CloudAttachmentReq();

        cloudPrintAttachmentReq.setKey(key);
        cloudPrintAttachmentReq.setMethod(ApiInfoConstant.CLOUD_PRINT_ATTACHMENT_METHOD);
        cloudPrintAttachmentReq.setT(t);
        cloudPrintAttachmentReq.setSign(SignUtils.printSign(param,t,key,secret));
        cloudPrintAttachmentReq.setParam(param);
        cloudPrintAttachmentReq.setFile(new File("C:\\Users\\Administrator.-20171106WFEKLN\\Desktop\\1.jpg"));

        IBaseClient baseClient = new CloudPrintAttachment();
        System.out.println(baseClient.execute(cloudPrintAttachmentReq));
    }

    /**
     * 复打(v1版本示例，建议使用v2)
     */
    @Test
    public void testCloudPrintOld() throws Exception{
        PrintReq printReq = new PrintReq();
        CloudPrintOldParam cloudPrintOldParam = new CloudPrintOldParam();
        cloudPrintOldParam.setTaskId("A32AA6754669C14CBE26EB79664D2266");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(cloudPrintOldParam);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.CLOUD_PRINT_OLD_METHOD);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient cloudPrintOld = new CloudPrintOld();
        System.out.println(cloudPrintOld.execute(printReq));
    }

    /**
     * 第三方平台账号授权
     */
    @Test
    public void testThirdAuth() throws Exception{
        PrintReq printReq = new PrintReq();
        ThirdAuthReq thirdAuthReq = new ThirdAuthReq();
        thirdAuthReq.setNet("taobao");
        thirdAuthReq.setCallBackUrl("http://www.baidu.com");
        thirdAuthReq.setView("web");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(thirdAuthReq);

        printReq.setKey(key);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient thirdAuth = new ThirdAuth();
        System.out.println(thirdAuth.execute(printReq));
    }

    /**
     * 快递100短信发送接口
     */
    @Test
    public void testSendSms() throws Exception{
        SendSmsReq sendSmsReq = new SendSmsReq();
        sendSmsReq.setCallback("http://www.baidu.com");
        Map<String,String> content = new HashMap<String, String>();
        content.put("username","测试用户");
        sendSmsReq.setContent(new Gson().toJson(content));
        sendSmsReq.setPhone("15994708912");
        sendSmsReq.setSeller("贵司名称");
        sendSmsReq.setUserid(userid);
        sendSmsReq.setTid(tid);
        sendSmsReq.setSign(SignUtils.smsSign(key,userid));

        IBaseClient sendSms = new SendSms();
        System.out.println(sendSms.execute(sendSmsReq));
    }


    /**
     * 发货单接口
     *
     * @throws Exception
     */
    @Test
    public void  testCloudPrintParcelsBill() throws Exception {

        CloudPrintParcelsBillReq cloudPrintParcelsBillReq = new CloudPrintParcelsBillReq();

        cloudPrintParcelsBillReq.setCallBackUrl("http://www.baidu.com");
        cloudPrintParcelsBillReq.setTempid("164509714515858026");
        cloudPrintParcelsBillReq.setSiid(siid);


        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(cloudPrintParcelsBillReq);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BILL_PARCELS_METHOD);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setT(t);
        printReq.setParam(param);

        IBaseClient parcelsBill = new CloudPrintParcelsBill();
        System.out.println(parcelsBill.execute(printReq));
    }

    /**
     * 快递面单OCR识别接口
     *
     * @throws Exception
     */
    @Test
    public void  testElecDetocr() throws Exception {

        OrcParam orcParam = new OrcParam();
        orcParam.setImageUrl("https://cdn.kuaidi100.com/images/openapi/document/ocr_tem.png");
        String param = new Gson().toJson(orcParam);

        PrintReq printReq = new PrintReq();
        printReq.setKey(key);
        printReq.setParam(param);

        IBaseClient orc = new ElecDetocr();
        System.out.println(orc.execute(printReq));

    }


    /**
     * 快递可用性查询
     *
     * @throws Exception
     */
    @Test
    public void  testExpressReachable() throws Exception {

        PrintReq printReq = new PrintReq();
        ExpressReachableReq expressReachableReq = new ExpressReachableReq();
        expressReachableReq.setKuaidicom("ems");
        expressReachableReq.setRecManName("张三");
        expressReachableReq.setRecManMobile("12345678910");
        expressReachableReq.setRecManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");
        expressReachableReq.setSendManName("李四");
        expressReachableReq.setSendManMobile("12345678910");
        expressReachableReq.setSendManPrintAddr("西藏日喀则市定日县珠穆朗玛峰");


        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(expressReachableReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.REACHABLE_METHOD);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient cloudPrintOld = new ExpressReachable();
        System.out.println(cloudPrintOld.execute(printReq));

    }

    /**
     * 同城寄件-预下单
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityPrice() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityOrderReq bsamecityOrderReq = new BsamecityOrderReq();
        bsamecityOrderReq.setKuaidicom("shunfengtongcheng");
        bsamecityOrderReq.setLbsType(2);
        bsamecityOrderReq.setRecManName("张三");
        bsamecityOrderReq.setRecManMobile("12345678910");
        bsamecityOrderReq.setRecManProvince("北京市");
        bsamecityOrderReq.setRecManCity("北京市");
        bsamecityOrderReq.setRecManDistrict("海淀区");
        bsamecityOrderReq.setRecManAddr("学清嘉创大厦A座15层");
        bsamecityOrderReq.setRecManLat("40.014838");
        bsamecityOrderReq.setRecManLng("116.352569");
        bsamecityOrderReq.setSendManName("李四");
        bsamecityOrderReq.setSendManMobile("12345678910");
        bsamecityOrderReq.setSendManProvince("北京市");
        bsamecityOrderReq.setSendManCity("北京市");
        bsamecityOrderReq.setSendManDistrict("海淀区");
        bsamecityOrderReq.setSendManAddr("清华大学");
        bsamecityOrderReq.setSendManLat("40.002436");
        bsamecityOrderReq.setSendManLng("116.326582");
        bsamecityOrderReq.setWeight("1");
        bsamecityOrderReq.setRemark("测试下单");
        bsamecityOrderReq.setVolume("");
        bsamecityOrderReq.setOrderType(0);
        bsamecityOrderReq.setExpectPickupTime("");
        bsamecityOrderReq.setExpectFinishTime("");
        bsamecityOrderReq.setInsurance("");
        bsamecityOrderReq.setPrice("0");
        Goods goods = new Goods("外卖", "食品", 1);
        ArrayList<Goods> goods_list = new ArrayList<Goods>();
        goods_list.add(goods);
        bsamecityOrderReq.setGoods(goods_list);

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityOrderReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.PRICE);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }

    /**
     * 同城寄件-下单
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityOrder() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityOrderReq bsamecityOrderReq = new BsamecityOrderReq();
        bsamecityOrderReq.setKuaidicom("shunfengtongcheng");
        bsamecityOrderReq.setLbsType(2);
        bsamecityOrderReq.setRecManName("张三");
        bsamecityOrderReq.setRecManMobile("12345678910");
        bsamecityOrderReq.setRecManProvince("北京市");
        bsamecityOrderReq.setRecManCity("北京市");
        bsamecityOrderReq.setRecManDistrict("海淀区");
        bsamecityOrderReq.setRecManAddr("学清嘉创大厦A座15层");
        bsamecityOrderReq.setRecManLat("40.014838");
        bsamecityOrderReq.setRecManLng("116.352569");
        bsamecityOrderReq.setSendManName("李四");
        bsamecityOrderReq.setSendManMobile("12345678910");
        bsamecityOrderReq.setSendManProvince("北京市");
        bsamecityOrderReq.setSendManCity("北京市");
        bsamecityOrderReq.setSendManDistrict("海淀区");
        bsamecityOrderReq.setSendManAddr("清华大学");
        bsamecityOrderReq.setSendManLat("40.002436");
        bsamecityOrderReq.setSendManLng("116.326582");
        bsamecityOrderReq.setWeight("1");
        bsamecityOrderReq.setRemark("测试下单");
        bsamecityOrderReq.setVolume("");
        bsamecityOrderReq.setOrderType(0);
        bsamecityOrderReq.setExpectPickupTime("");
        bsamecityOrderReq.setExpectFinishTime("");
        bsamecityOrderReq.setInsurance("");
        bsamecityOrderReq.setPrice("0");
        Goods goods = new Goods("外卖", "食品", 1);
        ArrayList<Goods> goods_list = new ArrayList<Goods>();
        goods_list.add(goods);
        bsamecityOrderReq.setGoods(goods_list);
        bsamecityOrderReq.setCallbackUrl("http://baidu.com");
        bsamecityOrderReq.setSalt("");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityOrderReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BSAMECITY_ORDER);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }

    /**
     * 同城寄件-预取消
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityPrecancel() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityCancelReq bsamecityCancelReq = new BsamecityCancelReq();
        bsamecityCancelReq.setOrderId("100094");
        bsamecityCancelReq.setCancelMsgType(1);
        bsamecityCancelReq.setCancelMsg("测试寄件");
        bsamecityCancelReq.setTaskId("3B8E825DCCEE4F28B4A93685DA62F7F2");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityCancelReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BSAMECITY_PRECANCEL);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }

    /**
     * 同城寄件-取消
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityCancel() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityCancelReq bsamecityCancelReq = new BsamecityCancelReq();
        bsamecityCancelReq.setOrderId("100239");
        bsamecityCancelReq.setCancelMsgType(1);
        bsamecityCancelReq.setCancelMsg("测试寄件");
        bsamecityCancelReq.setTaskId("BEA8285B6A014A1A94707CE3CF484D0A");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityCancelReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BSAMECITY_CANCEL);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }

    /**
     * 同城寄件-加小费
     *
     * @throws Exception
     */
    @Test
    public void  testBsamecityAddfee() throws Exception {

        PrintReq printReq = new PrintReq();
        BsamecityAddfeeReq bsamecityAddfeeReq = new BsamecityAddfeeReq();
        bsamecityAddfeeReq.setOrderId("100240");
        bsamecityAddfeeReq.setRemark("加钱");
        bsamecityAddfeeReq.setTaskId("1F495CE0E58B40A296694116CFBCE347");
        bsamecityAddfeeReq.setTips("10");

        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(bsamecityAddfeeReq);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.BSAMECITY_ADDFEE);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient bsamecityPrice = new BsameCityExpress();
        System.out.println(bsamecityPrice.execute(printReq));
    }

    /**
     * 价格查询接口
     *
     * @throws Exception
     */
    @Test
    public void  testPriceQuery() throws Exception {
        PrintReq printReq = new PrintReq();
        PriceQueryParam priceQueryParam = new PriceQueryParam();
        priceQueryParam.setSendAddr("深圳南山区");
        priceQueryParam.setRecAddr("北京海淀区");
        priceQueryParam.setKuaidicom("kuayue");
        priceQueryParam.setWeight(30.0);
        // TODO 请替换为真实的月卡号，非必传，跨越必传
        priceQueryParam.setMonthlyCard("123456789012");

        String param = new Gson().toJson(priceQueryParam);
        String t = System.currentTimeMillis() + "";
        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.PRICE);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);
        IBaseClient baseClient = new PriceQuery();
        System.out.println(baseClient.execute(printReq));
    }

}
