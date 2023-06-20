import TelegramBot from "node-telegram-bot-api";
import express from "express";
import fetch from "node-fetch";

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const renderUrl = "https://workout-dngg.onrender.com";
const airtableUrl = "https://api.airtable.com/v0";
const gridViewNumber = 20;

bot.setWebHook(`${renderUrl}/bot${process.env.TELEGRAM_BOT_TOKEN}`);

app.use(express.json());

app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}/`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
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
      `${airtableUrl}/${process.env.AIRTABLE_BASE_ID}/Workout?maxRecords=12&view=Grid%${gridViewNumber}view`,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error({ message: "無法取得運動建議" });
    }
    const data = await response.json();

    const matchingRecords = data.records.filter((record) => {
      const exercisePart = record.fields.輸入部位.toLowerCase();
      return exercisePart === bodyPart.toLowerCase();
    });

    if (matchingRecords.length === 0) {
      const message = `很抱歉暫時沒有您希望的運動部位\n請輸入以下的部位名稱進行查詢\nShoulder\nArm\nBack\nLegs\nCore\nChest`;
      bot.sendMessage(chatId, message);
    } else {
      const matchingData = matchingRecords.map((data) => {
        return {
          id: data.id,
          運動名稱: data.fields.運動名稱,
          描述: data.fields["描述（Long Text）"],
          輸入部位: data.fields.輸入部位,
        };
      });

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
