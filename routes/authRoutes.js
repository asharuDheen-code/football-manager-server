const express = require("express");
const { registerOrLogin } = require("../controllers/authController");

const router = express.Router();

router.post("/", registerOrLogin);

module.exports = router;
