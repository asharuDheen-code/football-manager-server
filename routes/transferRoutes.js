const express = require("express");
const transferController = require("../controllers/transferController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/market", authMiddleware, transferController.getTransferMarket);

router.post("/toggle", authMiddleware, transferController.toggleTransferList);

router.post("/buy", authMiddleware, transferController.buyPlayer);

router.get(
  "/transfer-list",
  authMiddleware,
  transferController.getTransferList
);

module.exports = router;
