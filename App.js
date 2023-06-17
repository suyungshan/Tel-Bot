//使用 import (ES6) 的方式導入 node-telegram-bot-api 模組
import TelegramBot from "node-telegram-bot-api";
import express from "express";

//使用 express 框架
const app = express();
const bot = new TelegramBot("6072177457:AAHSnFucxpr3lBt4QX758s-bSK3m5b_n_CY");

app.use(express.json());

app.post(`/bot6072177457:AAHSnFucxpr3lBt4QX758s-bSK3m5b_n_CY/`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
bot.setWebHook(
  "https://workout-dngg.onrender.com/bot6072177457:AAHSnFucxpr3lBt4QX758s-bSK3m5b_n_CY"
);

bot.onText(/\/start/, (msg) => {
  console.log(msg);
  console.log(msg.chat);

  const chatId = msg.chat.id;
  const message =
    "歡迎使用健身機器人！請傳入您想鍛鍊的部位，例如：/exercise chest";
  bot.sendMessage(chatId, message);
});

bot.onText(/\/exercise (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const bodyPart = match[1];
  try {
    const response = await fetch(
      "https://api.airtable.com/v0/appJeM7ssI2ScYGK0/Workout?maxRecords=12&view=Grid%20view",
      {
        headers: {
          Authorization: "Bearer keyyQYd2HGNFmM2gF",
        },
      }
    );
    if (!response.ok) {
      throw new Error({ message: "無法取得運動建議" });
    }
    const data = await response.json();

    //將 data 的 records 陣列透過 filter 與用戶輸入的部位關鍵字做比對，取出對應的資料
    const matchingRecords = data.records.filter((record) => {
      //將拉出的對應部位與擷取到的用戶輸入值都先轉成相同格式(這邊是全轉為小寫)再進行比對
      const exercisePart = record.fields.輸入部位.toLowerCase();
      return exercisePart === bodyPart.toLowerCase();
    });

    //設定條件式，若部位不存在，則會呈現空陣列，因此若 matchingRecords 為空陣列的話，表示部位不匹配，藉此回傳錯誤訊息
    if (matchingRecords.length === 0) {
      const message = `很抱歉暫時沒有您希望的運動部位\n請輸入以下的部位名稱進行查詢\nShoulder\nArm\nBack\nLegs\nCore\nChest`;
      bot.sendMessage(chatId, message);
    } else {
      //對應資料再透過 map 取出要回傳給 User 的資訊
      const matchingData = matchingRecords.map((data) => {
        return {
          id: data.id,
          運動名稱: data.fields.運動名稱,
          描述: data.fields["描述（Long Text）"],
          輸入部位: data.fields.輸入部位,
        };
      });
      console.log(matchingData);
      //將透過 map 給 user 的資訊陣列透過 forEach 取出陣列中的每個物件，並提取我們要的物件資訊放入 message，再回傳給 Bot
      matchingData.forEach((exercise) => {
        const message = `根據您的選擇，推薦的運動項目為：${exercise.運動名稱}\n\n使用方式為：${exercise.描述}`;
        bot.sendMessage(chatId, message);
      });
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, error.message);
  }
});

app.listen(3000, () => {
  console.log("Express server is listening on port 3000");
});
