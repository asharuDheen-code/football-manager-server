const express = require("express");
const { getTeam, getMyTeam } = require("../controllers/teamController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/team", authMiddleware, getTeam);
router.get("/my-team", authMiddleware, getMyTeam);

module.exports = router;
