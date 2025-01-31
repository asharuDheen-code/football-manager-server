const express = require("express");
const { buyPlayer, getPlayer } = require("../controllers/playerController");
const authMiddleware = require("../middleware/auth");
const generatePlayers = require("../utils/generatePlayers");

const router = express.Router();

router.post("/buy", authMiddleware, buyPlayer);
router.get("/create", generatePlayers);
router.get("/players", getPlayer);

module.exports = router;
