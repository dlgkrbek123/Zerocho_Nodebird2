exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    // next에 인자넣으면 에러 처리
    // 그냥하면 다음 미들웨어로
  } else {
    res.status(401).send("로그인이 필요합니다.");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send("이미 로그인되었습니다.");
  }
};
