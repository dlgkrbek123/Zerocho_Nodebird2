const express = require("express");
const cors = require("cors");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const db = require("./models/index");

const app = express();
db.sequelize
  .sync()
  .then(() => {
    console.log("db 연결 성공");
  })
  .catch(console.error);
// sync시 테이블이 존재하면 새로 만들지 않음

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);
app.use(express.json()); // json
app.use(express.urlencoded({ extended: true })); // form
// req.body에 데이터를 넣어줌

app.use("/post", postRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("hello express");
});

app.get("/api", (req, res) => {
  res.send("hello api");
});

app.listen(3065, () => {
  console.log("서버 실행 중");
});
