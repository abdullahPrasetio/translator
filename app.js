require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const translate = require("@vitalets/google-translate-api");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const axios = require("axios");
const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;
const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
};
app.use("/", indexRouter);
app.use("/users", usersRouter);

app.post(URI, async (req, res) => {
  if (req.body.message) {
    const chatId = req.body.message.chat.id;
    let text = "";
    if (req.body.message.text != null) {
      text = await checkText(req.body.message.text);
    }

    if (text.length > 0 && req.body.document == null) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text,
      });
    }
  }
  if (req.body.edited_message) {
    const chatId = req.body.edited_message.chat.id;

    let text = "";
    if (req.body.message.text != null) {
      text = await checkText(req.body.message.text);
    }
    if (text.length > 0 && req.body.document == null) {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text,
      });
    }
  }
  return res.send();
});

app.listen(process.env.PORT || 3000, async () => {
  await init();
});

async function checkText(text) {
  let result = "";
  if (text.length > 0 || text != undefined) {
    if (text == "/start") {
      result = `Silahkan Memulai Translate 
      gunakan /trid 'kata/kalimat yang mau diterjemahkan' untuk translate dari bahasa indonesia ke bahasa inggris 
      gunakan /tren 'kata/kalimat yang mau diterjemahkan' untuk translate dari bahasa inggris ke bahasa indonesia`;
    }
    if (text == "/trid") {
      result =
        "Apa yang mau diterjemahkan ke bahasa indonesia? \n gunakan /trid 'kata/kalimat yang mau diterjemahkan'";
    }
    const textReqId = text.split("/trid ");
    if (textReqId.length > 1) {
      try {
        const res = await translate(textReqId[1], {
          to: "en",
          from: "id",
          client: "gtx",
        })
          .then((resul) => {
            result = resul.raw[1][0][0][5][0][4][0][0];
          })
          .catch((err) => {
            console.log("err", err);
          });
      } catch (err) {
        console.log(err);
      }
    }
    const textReqEn = text.split("/tren ");
    if (textReqEn.length > 1) {
      try {
        const res = await translate(textReqEn[1], {
          to: "id",
          from: "en",
          client: "gtx",
        })
          .then((resul) => {
            result = resul.raw[1][0][0][5][0][4][0][0];
          })
          .catch((err) => {
            console.log("err", err);
          });
      } catch (err) {
        console.log(err);
      }
    }
  }
  return result;
}
// module.exports = app;
