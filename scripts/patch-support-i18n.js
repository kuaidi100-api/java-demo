const fs = require('fs');
const p = 'F:/100fen/DK100/java-demo/packages/ui-components/src/i18n/messages.ts';
let s = fs.readFileSync(p, 'utf8');

const en = {
  "'support.fabAria'": "'Contact support'",
  "'support.sheetTitle'": "'Support center'",
  "'support.sheetHint'": "'Scan social QR or start AI / human chat'",
  "'support.qr.wechat'": "'WeChat'",
  "'support.qr.telegram'": "'Telegram'",
  "'support.qr.whatsapp'": "'WhatsApp'",
  "'support.bizTitle'": "'Choose business'",
  "'support.biz.express'": "'Express shipping'",
  "'support.biz.expressDesc'": "'Cross-border and domestic parcels'",
  "'support.biz.errand'": "'Errand / flash'",
  "'support.biz.errandDesc'": "'Same-city delivery'",
  "'support.biz.ride'": "'Ride hailing'",
  "'support.biz.rideDesc'": "'Instant rides and trip help'",
  "'support.biz.hotel'": "'Hotel booking'",
  "'support.biz.hotelDesc'": "'Brand hotels and date changes'",
  "'support.ai'": "'AI support'",
  "'support.human'": "'Human agent'",
  "'support.needBiz'": "'Please choose a business first'",
  "'support.contact'": "'Contact support'",
  "'support.chatTitle'": "'Live support'",
  "'support.online'": "'Online'",
  "'support.offline'": "'Offline'",
  "'support.transfer'": "'Transfer to human'",
  "'support.inputPh'": "'Type a message…'",
  "'support.send'": "'Send'",
};

const zhHant = {
  "'support.fabAria'": "'聯繫客服'",
  "'support.sheetTitle'": "'客服中心'",
  "'support.sheetHint'": "'掃碼添加社交帳號，或選擇 AI / 人工會話'",
  "'support.qr.wechat'": "'微信'",
  "'support.qr.telegram'": "'Telegram'",
  "'support.qr.whatsapp'": "'WhatsApp'",
  "'support.bizTitle'": "'選擇業務'",
  "'support.biz.express'": "'速遞寄件'",
  "'support.biz.expressDesc'": "'跨境/國內寄件與查件'",
  "'support.biz.errand'": "'跑腿閃送'",
  "'support.biz.errandDesc'": "'同城急送與跑腿'",
  "'support.biz.ride'": "'一鍵約車'",
  "'support.biz.rideDesc'": "'即時用車與行程協助'",
  "'support.biz.hotel'": "'酒店預定'",
  "'support.biz.hotelDesc'": "'品牌酒店預約與改期'",
  "'support.ai'": "'AI 客服'",
  "'support.human'": "'人工客服'",
  "'support.needBiz'": "'請先選擇業務類型'",
  "'support.contact'": "'聯繫客服'",
  "'support.chatTitle'": "'線上客服'",
  "'support.online'": "'線上'",
  "'support.offline'": "'離線'",
  "'support.transfer'": "'轉人工'",
  "'support.inputPh'": "'輸入訊息…'",
  "'support.send'": "'發送'",
};

let idx = 0;
let count = 0;
while (true) {
  const i = s.indexOf("'photo.missingPkg'", idx);
  if (i < 0) break;
  count += 1;
  const endLine = s.indexOf('\n', i);
  const after = s.slice(endLine + 1);
  if (after.trimStart().startsWith("'support.")) {
    idx = i + 1;
    continue;
  }
  if (count === 1) {
    idx = i + 1;
    continue;
  }
  const map = count === 2 ? zhHant : en;
  const insert =
    Object.entries(map)
      .map(([k, v]) => `  ${k}: ${v},`)
      .join('\n') + '\n';
  s = s.slice(0, endLine + 1) + insert + s.slice(endLine + 1);
  idx = endLine + 1 + insert.length;
}

fs.writeFileSync(p, s);
console.log('blocks', count);
