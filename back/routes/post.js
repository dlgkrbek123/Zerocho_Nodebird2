const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, content: "hello" },
    { id: 2, content: "hello" },
    { id: 3, content: "hello" },
  ]);
});

router.post("/", (req, res) => {
  res.json({ id: 1, content: "hello" });
});

router.delete("/", (req, res) => {
  req.json({ id: 1 });
});

module.exports = router;
