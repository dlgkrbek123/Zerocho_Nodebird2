const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

dotenv.config();

const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const db = require("./models/index");
const passportConfig = require("./passport");

const app = express();
db.sequelize
  .sync()
  .then(() => {
    console.log("db 연결 성공");
  })
  .catch(console.error);
// sync시 테이블이 존재하면 새로 만들지 않음

passportConfig();

app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);
app.use(express.json()); // json
app.use(express.urlencoded({ extended: true })); // form
// req.body에 데이터를 넣어줌

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/post", postRouter);
app.use("/user", userRouter);

// 기본적으로 에러 핸들링 미들웨어가 있음
// (err, req,res, next) 로 구현가능

app.listen(3065, () => {
  console.log("서버 실행 중");
});
