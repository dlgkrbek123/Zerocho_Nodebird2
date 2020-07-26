const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const { User, Post } = require("../models");

router.post("/login", (req, res, next) => {
  // 미들웨어 확장
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }

    // 서비스 로그인, passport 로그인 두 번한다.

    return req.login(user, async (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }

      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: ["id", "nickname", "email"],
        include: [
          {
            model: Post,
          },
          {
            model: User,
            as: "Followings",
          },
          {
            model: User,
            as: "Followers",
          },
        ],
      });

      // 내부적으로 req.setHeader("Cookie", "cxlhy")을 구현
      return res.status(200).json(fullUserWithoutPassword);
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.send("ok");
});

router.post("/", async (req, res, next) => {
  try {
    const { email, nickname, password } = req.body;

    const exUser = await User.findOne({
      where: { email },
    });
    if (exUser) {
      res.status(403).send("이미 사용중인 아이디입니다.");
      return;
    }

    // 두번쨰 인자가 클 수록 보안이 높아짐
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nickname,
      password: hashedPassword,
    });
    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    next(error);
  }
});

module.exports = router;
