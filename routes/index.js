var express = require("express");
var router = express.Router();

/* GET home page. */
const translate = require("@vitalets/google-translate-api");
router.get("/translate/:from/:to", async function (req, res) {
  try {
    const result = await translate(req.query.text, {
      to: req.params.to,
      from: req.params.from,
      client: "gtx",
    })
      .then((resul) => {
        res.json({ message: "success", data: resul.raw[1][0][0][5][0][4] });
      })
      .catch((err) => {
        // console.log("err", err);
      });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
