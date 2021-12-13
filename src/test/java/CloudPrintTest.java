import com.google.gson.Gson;
import com.kuaidi100.sdk.api.CloudPrintAttachment;
import com.kuaidi100.sdk.api.CloudPrintCommand;
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
 * @Author: api.kuaidi100.com
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

    /**
     * 指令打印接口
     */
    @Test
    public void testCloudPrintCommand() throws Exception{
        PrintReq printReq = new PrintReq();
        CloudPrintCommandParam cloudPrintCommandParam = new CloudPrintCommandParam();
        cloudPrintCommandParam.setContent("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");
        cloudPrintCommandParam.setSiid("");
        String t = System.currentTimeMillis() + "";
        String param = new Gson().toJson(cloudPrintCommandParam);

        printReq.setKey(key);
        printReq.setMethod(ApiInfoConstant.CLOUD_PRINT_COMMAND);
        printReq.setT(t);
        printReq.setSign(SignUtils.printSign(param,t,key,secret));
        printReq.setParam(param);

        IBaseClient cloudPrintOld = new CloudPrintCommand();
        System.out.println(cloudPrintOld.execute(printReq));
    }
}
