module.exports = (sequelize, DataTypes) => {
  const Hashtag = sequelize.define(
    "Hashtag",
    {
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      charset: "utf8mb4", // utf8 + 이모티콘까지
      colate: "utf8mb4_general_ci",
    }
  );

  // 해시태그 하나가 여러개의 게시글에 대응 가능
  // 게시글도 여러개의 해시태그를 여러개 가질 수 있다.
  // 다대다 관계

  Hashtag.associate = (db) => {
    db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" });
  };
  return Hashtag;
};
