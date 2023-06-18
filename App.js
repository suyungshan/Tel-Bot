//使用 import (ES6) 的方式導入 node-telegram-bot-api 模組
import TelegramBot from "node-telegram-bot-api";
import express from "express";
import fetch from "node-fetch";

//使用 express 框架
const app = express();
const bot = new TelegramBot("6072177457:AAHSnFucxpr3lBt4QX758s-bSK3m5b_n_CY");

//使用 setWebHook 告訴 telegram 說如果有新的資訊(例如用戶傳送訊息)，則將該動作資訊傳遞到 render 網站(https://workout-dngg.onrender.com/)中的 workout bot 中(bot6072177457:AAHSnFucxpr3lBt4QX758s-bSK3m5b_n_CY)
bot.setWebHook(
  "https://workout-dngg.onrender.com/bot6072177457:AAHSnFucxpr3lBt4QX758s-bSK3m5b_n_CY"
);

//透過 app.use 使用中介軟體（middleware）express.json()，解析請求的 JSON 格式資料。當你的應用程式需要處理 POST 或其他請求中的 JSON 資料時，你可以使用這個中介軟體來解析並提取請求(setWebHook 傳遞過來的請求資訊)中的 JSON 資料給 bot.processUpdate
//這裡的 express.json() 方法並不需要指定特定的路徑或 URL。它的作用是在整個 Express 應用程式中，無論收到的請求是從哪個路徑發送的，都會對請求的主體進行 JSON 解析。
//當您在 app.use(express.json()) 中使用這個中間件後，不論是哪個路由處理函數，只要收到的請求主體是 JSON 格式，它都會自動解析並將資料放在 req.body 中供後續處理使用。
app.use(express.json());

//透過 app.post接收 /bot6072177457:AAHSnFucxpr3lBt4QX758s-bSK3m5b_n_CY/ 所獲取的最新資訊，此時已由 app.use(express.json()); 解析完成並放入 req.body 中，因此將 req.body 傳入 bot.processUpdate() 給 bot 的其他 method 使用
//同時透過 res.sendStatus(200) 回傳 status 200(成功)給 Telegram，表示已成功接收和處理更新，不然 telegram 因沒收到回應，會一直發送詢問
app.post(`/bot6072177457:AAHSnFucxpr3lBt4QX758s-bSK3m5b_n_CY/`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

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

// app.listen(3000, () => {
//   console.log("Express server is listening on port 3000");
// });
