const express = require("express");
const router = express.Router();
const { Post, User, Image, Comment } = require("../models");

router.get("/", async (req, res, next) => {
  try {
    //   limit: 10, 개수제한
    //   offset: 10 11 ~ 20
    //   실무에서는 limit, offset 방식 잘 안 씀
    //   게시판과 페이지네이션에서는 적합
    //   게시글 추가, 삭제에 취약
    //   order: [["createdAt", "DESC"]]

    // lastId 방식을 사용하자.
    // 마지막에 얻은 id
    const posts = await Post.findAll({
      //   where: { id: lastId },
      limit: 10,
      order: [
        ["createdAt", "DESC"],
        [Comment, "createdAt", "DESC"],
      ],
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["id", "nickname"],
            },
          ],
        },
        {
          model: User,
          as: "Likers",
          attributes: ["id"],
        },
      ],
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
