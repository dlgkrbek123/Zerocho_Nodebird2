const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../models");

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
