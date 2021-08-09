package com.kuaidi100.sdk.utils;

import com.sun.org.apache.xerces.internal.impl.dv.util.Base64;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Mali
 * @since 2021/7/22 16:37
 */
public class PdfUtils {

    /**
     * PDF BASE64 转换 PDF FILE
     */
    public static void base64StringToPdf(String base64sString, String fileName) {
        BufferedInputStream bin = null;
        FileOutputStream fout = null;
        BufferedOutputStream bout = null;
        try {
            // 将base64编码的字符串解码成字节数组
            byte[] bytes = Base64.decode(base64sString);
            ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes);
            // 创建从底层输入流中读取数据的缓冲输入流对象
            bin = new BufferedInputStream(inputStream);
            // 指定输出的文件
            File file = new File(fileName);
            // 创建到指定文件的输出流
            fout = new FileOutputStream(file);
            // 为文件输出流对接缓冲输出流对象
            bout = new BufferedOutputStream(fout);
            byte[] buffers = new byte[1024];
            int len = bin.read(buffers);
            while (len != -1) {
                bout.write(buffers, 0, len);
                len = bin.read(buffers);
            }
            // 刷新此输出流并强制写出所有缓冲的输出字节，必须这行代码，否则有可能有问题
            bout.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                bin.close();
                fout.close();
                bout.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * PDF BASE64 转换 IMAGE BASE64
     */
    public static List<String> base64PdfToImgBase64(String pdfBase64) {
        return base64PdfToImgBase64(pdfBase64, "png");
    }

    /**
     * PDF BASE64 转换 IMAGE BASE64
     * 图片类型
     */
    public static List<String> base64PdfToImgBase64(String pdfBase64, String imgType) {
        List<String> imgBase64List = new ArrayList<>();
        try {
            byte [] byteArray = Base64.decode(pdfBase64);
            PDDocument doc = PDDocument.load(byteArray);
            PDFRenderer renderer = new PDFRenderer(doc);
            int pageCount = doc.getNumberOfPages();
            for (int i = 0; i < pageCount; i++) {
                // DPI越高，清晰度越高，速度越慢
                BufferedImage image = renderer.renderImageWithDPI(i, 320);
                //输出流
                ByteArrayOutputStream stream = new ByteArrayOutputStream();
                ImageIO.write(image, imgType, stream);
                imgBase64List.add(Base64.encode(stream.toByteArray()));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return imgBase64List;
    }
}
