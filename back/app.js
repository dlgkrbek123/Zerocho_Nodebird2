const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

dotenv.config();

const postRouter = require("./routes/post");
const postsRouter = require("./routes/posts");
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

app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:3060",
    credentials: true, // true로 해야 쿠키도 전달이된다.
    // true로 하면 origin을 정확히 입력해야한다.
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
app.use("/posts", postsRouter);

// 기본적으로 에러 핸들링 미들웨어가 있음
// (err, req,res, next) 로 구현가능

app.listen(3065, () => {
  console.log("서버 실행 중");
});
