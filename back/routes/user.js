const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const { User, Post } = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middleware");

router.get("/", async (req, res, next) => {
  try {
    if (req.user) {
      const user = await User.findOne({
        where: { id: req.user.id },
        attributes: ["id", "nickname", "email"],
        include: [
          {
            model: Post,
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followings",
            attributes: ["id"],
          },
          {
            model: User,
            as: "Followers",
            attributes: ["id"],
          },
        ],
      });
      res.status(200).json(user);
    } else {
      res.status(200).json(null);
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/", isNotLoggedIn, async (req, res, next) => {
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

router.post("/login", isNotLoggedIn, (req, res, next) => {
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

router.post("/logout", isLoggedIn, (req, res, next) => {
  req.logout();
  req.session.destroy();
  res.send("ok");
});

router.patch("/nickname", async (req, res, next) => {
  try {
    await User.update(
      {
        nickname: req.body.nickname,
      },
      {
        where: { id: req.user.id },
      }
    );
    res.status(200).json({
      nickname: req.body.nickname,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch("/:userId/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.userId,
      },
    });
    if (!user) {
      return res.status(403).send("존재하지 않는 유저입니다.");
    }
    await user.addFollowers(req.user.id);

    res.status(200).json({
      UserId: parseInt(req.params.userId),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:userId/follow", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.params.userId,
      },
    });
    if (!user) {
      return res.status(403).send("존재하지 않는 유저입니다.");
    }
    await user.removeFollowers(req.user.id);

    res.status(200).json({
      UserId: parseInt(req.params.userId),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/followers", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
    });
    if (!user) {
      return res.status(403).send("존재하지 않는 유저입니다.");
    }
    const followers = await user.getFollowers();

    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/followings", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
    });
    if (!user) {
      return res.status(403).send("존재하지 않는 유저입니다.");
    }

    const followings = await user.getFollowings();
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/follower/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.userId },
    });
    if (!user) {
      res.status(403).send("존재하지 않는 유저입니다.");
    }

    await user.removeFollowings(req.user.id);
    res.status(200).json({
      UserId: parseInt(req.params.userId),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
