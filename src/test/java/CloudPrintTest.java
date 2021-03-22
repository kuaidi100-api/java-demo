import com.google.gson.Gson;
import com.kuaidi100.sdk.api.CloudPrintAttachment;
import com.kuaidi100.sdk.api.CloudPrintCustom;
import com.kuaidi100.sdk.api.CloudPrintOld;
import com.kuaidi100.sdk.contant.ApiInfoConstant;
import com.kuaidi100.sdk.core.IBaseClient;
import com.kuaidi100.sdk.request.*;
import com.kuaidi100.sdk.utils.SignUtils;
import org.junit.Test;

import java.io.File;

/**
 * 云打印测试用例
 *
 * @Author: ligl
 * @Date: 2021-03-22 18:49
 */
public class CloudPrintTest extends BaseServiceTest{

    /**
     * 云打印自定义
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
     * 云打印附件
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
     * 复打
     */
    @Test
    public void testCloudPrintOld() throws Exception{
        PrintReq printReq = new PrintReq();
        CloudPrintOldParam cloudPrintOldParam = new CloudPrintOldParam();
        cloudPrintOldParam.setTaskId("D21DB1AC74A260E6F5604FC43B4598B8");

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
}
