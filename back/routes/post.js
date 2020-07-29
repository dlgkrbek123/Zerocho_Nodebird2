const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { isLoggedIn } = require("./middleware");
const { Post, Comment, Image, User, Hashtag } = require("../models");

const router = express.Router();

try {
  fs.accessSync("uploads");
} catch (err) {
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, res, done) {
      done(null, "uploads");
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname); // .확장자
      const basename = path.basename(file.originalname, ext); // 이름

      done(null, `${basename}_${new Date().getTime()}${ext}`);
    },
  }),
  limit: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.post("/", isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({
            where: { name: tag.slice(1).toLowerCase() },
          })
        )
      );
      await post.addHashtags(result.map((v) => v[0]));
    }

    if (req.body.image) {
      if (Array.isArray(req.body.image)) {
        const images = await Promise.all(
          req.body.image.map((image) => Image.create({ src: image }))
        );
        await post.addImages(images);
      } else {
        const image = await Image.create({ src: req.body.image });
        await post.addImages(image);
      }
    }

    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
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
          attributes: ["id", "nickname"],
        },
        {
          model: User,
          as: "Likers",
          attributes: ["id"],
        },
      ],
    });

    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:postId", isLoggedIn, async (req, res, next) => {
  try {
    await Post.destroy({
      where: {
        id: parseInt(req.params.postId),
        UserId: req.user.id,
      },
    });
    res.status(200).json({ PostId: parseInt(req.params.postId) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// req.params
router.post("/:postId/comment", isLoggedIn, async (req, res, next) => {
  try {
    const post = Post.findOne({
      where: {
        id: req.params.postId,
      },
    });

    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }

    const comment = await Comment.create({
      PostId: parseInt(req.params.postId),
      UserId: req.user.id,
      content: req.body.content,
    });

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          attributes: ["id", "nickname"],
        },
      ],
    });

    res.status(201).json(fullComment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch("/:postId/like", async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: parseInt(req.params.postId) },
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }

    await post.addLikers(req.user.id);
    res.status(200).json({
      PostId: post.id,
      UserId: req.user.id,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/:postId/like", async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: parseInt(req.params.postId) },
    });
    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    await post.removeLikers(req.user.id);
    res.status(200).json({
      PostId: post.id,
      UserId: req.user.id,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 이미지, 동영상은 서버에 직접 구현하지 말고
// 바로 클라우드로 올리자.

router.post("/images", isLoggedIn, upload.array("image"), (req, res, next) => {
  // multer를 라우터에 장착 가능
  // 폼마다 타입이 다르다 app에 적용시 전체 적용되므로
  // 개별 적용

  // 이미지 업로드 후에 실행
  // 업로드된 경로를 프론트에 전송
  console.log(req.files);
  res.json(req.files.map((v) => v.filename));
});
// multipart한번에 보내기
// {
//  content : "엄준식",
//  img : binary
// }
// 이미지 미리보기는 애매함
// 백엔드는 간단한데...
// 업로드 하는 시점에 이미지가
// 처리되어서 느림
// ------------------------------------------
// 먼저 binary만 올려서 파일경로 받음
// 미리보기, 리사이징
// 사람들이 컨텐츠 작성
// 컨텐츠랑 이미지 경로를 올림
// 이미지만 업로드하고 게시글 안 쓰고 도망칠 수도있음
// 근데 일단 지우지는 않음
// 자산으로 치부

router.post("/:postId/retweet", isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
      include: [
        {
          model: Post,
          as: "Retweet",
        },
      ],
    });

    if (!post) {
      return res.status(403).send("존재하지 않는 게시글입니다.");
    }
    if (
      req.user.id === post.UserId ||
      (post.Retweet && post.Retweet.UserId === req.user.id)
    ) {
      // 자기 게시글을 리트윗
      // 자기글을 리트윗한 글을 다시 리트윗
      return res.status(403).send("자신의 글은 리트윗불가합니다.");
    }
    const retweetTargetId = post.RetweetId || post.id;
    const exPost = await Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });
    if (exPost) {
      return res.status(403).send("이미 리트윗했습니다.");
    }

    const retweet = await Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: "retweet",
    });
    const retweeWithPrevPost = await Post.findOne({
      where: {
        id: retweet.id,
        include: [
          {
            model: Post,
            as: "Retweet",
            include: [
              {
                model: User,
                attributes: ["id", "nickname"],
              },
            ],
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
            attributes: ["id", "nickname"],
          },
          {
            model: User,
            as: "Likers",
            attributes: ["id"],
          },
        ],
      },
    });

    res.status(201).json(retweeWithPrevPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
