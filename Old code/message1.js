//使用 import (ES6) 的方式導入 node-telegram-bot-api 模組
import TelegramBot from "node-telegram-bot-api";

//創建 new TelegramBot 的 instance，第一個參數輸入 token，第二個參數暫時使用 polling(輪詢)，並將其設為 true，定期向 Telegram 伺服器發送請求檢查是否有新的訊息或事件，以方便開發，待工能穩定後再轉為 Webhook
const bot = new TelegramBot("6072177457:AAHSnFucxpr3lBt4QX758s-bSK3m5b_n_CY", {
  polling: true,
});

//接收用戶訊息並回應運動建議

//透過 onText 監聽 /start，當 User 輸入 /start 時會觸發後方的函數，將用戶所傳的訊息透過 msg 傳入，其為一個物件
bot.onText(/\/start/, (msg) => {
  //我們需要獲取已接收訊息的聊天 ID。msg.chat 物件包含有關聊天的相關資訊，而 msg.chat.id 表示該聊天的唯一識別符，並存入變數 chatId 中。
  console.log(msg);
  console.log(msg.chat);
  const chatId = msg.chat.id;

  //建構 User 啟動 /start 時的回應訊息，並存入變數 message 中
  const message =
    "歡迎使用健身機器人！請傳入您想鍛鍊的部位，例如：/exercise chest";

  //透過 sendMessage method，將回應訊息發送給用戶，參照 chatId 回應對應的 message 訊息，其還有第三個參數 option 可以做更細微的回覆操作
  bot.sendMessage(chatId, message);
});

//解析用戶傳入的部位並回應相應的運動建議
//透過正則表達式來處理 User 輸入的字串符，.表示單一字串，+表示字串可以有一個或是多個，()用於構建捕獲組，表示需要捕獲該部分的匹配結果
bot.onText(/\/exercise (.+)/, (msg, match) => {
  //獲取已接收訊息的聊天 ID。msg.chat 物件包含有關聊天的相關資訊，而 msg.chat.id 表示該聊天的唯一識別符，並存入變數 chatId 中。
  const chatId = msg.chat.id;
  //透過 match method 獲取捕獲組的內容
  const bodyPart = match[1]; // 解析用戶傳入的部位
  // 使用 Airtable API 查詢相應的運動建議和資訊
  // 格式化回應訊息
  const message = `針對 ${bodyPart} 的運動建議：...`;
  bot.sendMessage(chatId, message);
});

//上述寫法可省去下方許多重複的 code
// bot.onText(/\/exercise Shoulder/, (msg, match) => {
//   const chatId = msg.chat.id;
//   const bodyPart = match[1]; // 解析用戶傳入的部位
//   // 使用 Airtable API 查詢相應的運動建議和資訊
//   // 格式化回應訊息
//   const message = `針對 ${bodyPart} 的運動建議：...`;
//   bot.sendMessage(chatId, message);
// });

// bot.onText(/\/exercise Arm/, (msg, match) => {
//   const chatId = msg.chat.id;
//   const bodyPart = match[1]; // 解析用戶傳入的部位
//   // 使用 Airtable API 查詢相應的運動建議和資訊
//   // 格式化回應訊息
//   const message = `針對 ${bodyPart} 的運動建議：...`;
//   bot.sendMessage(chatId, message);
// });

// bot.onText(/\/exercise Back/, (msg, match) => {
//   const chatId = msg.chat.id;
//   const bodyPart = match[1]; // 解析用戶傳入的部位
//   // 使用 Airtable API 查詢相應的運動建議和資訊
//   // 格式化回應訊息
//   const message = `針對 ${bodyPart} 的運動建議：...`;
//   bot.sendMessage(chatId, message);
// });

// bot.onText(/\/exercise legs /, (msg, match) => {
//   const chatId = msg.chat.id;
//   const bodyPart = match[1]; // 解析用戶傳入的部位
//   // 使用 Airtable API 查詢相應的運動建議和資訊
//   // 格式化回應訊息
//   const message = `針對 ${bodyPart} 的運動建議：...`;
//   bot.sendMessage(chatId, message);
// });

// bot.onText(/\/exercise Core /, (msg, match) => {
//   const chatId = msg.chat.id;
//   const bodyPart = match[1]; // 解析用戶傳入的部位
//   // 使用 Airtable API 查詢相應的運動建議和資訊
//   // 格式化回應訊息
//   const message = `針對 ${bodyPart} 的運動建議：...`;
//   bot.sendMessage(chatId, message);
// });
