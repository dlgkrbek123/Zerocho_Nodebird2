module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      // mysql의 users에 대응됨
      // id는 primary key로 기본 값 씀
      // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATETIME
      email: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      charset: "utf8",
      colate: "utf8_general_ci",
    }
  );

  User.associate = (db) => {
    db.User.hasMany(db.Post); // 사람이 게시글을 여러개 소유
    db.User.hasMany(db.Comment); // 사람이 게시글을 여러개 소유
    db.User.belongsToMany(db.Post, { through: "Like", as: "Liked" });

    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followers",
      foreignKey: "FollowingId",
    });
    db.User.belongsToMany(db.User, {
      through: "Follow",
      as: "Followings",
      foreignKey: "FollowerId",
    });
  };
  return User;
};
