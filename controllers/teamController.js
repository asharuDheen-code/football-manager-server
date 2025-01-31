const Team = require("../models/Team");
const User = require("../models/User");
const Player = require("../models/Player");

const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.userId }).populate("players");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({
      budget: team.budget,
      name: team.name,
      players: team.players,
    });
  } catch (err) {
    console.error("Error fetching team details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.userId }).populate("players");
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTeam, getMyTeam };
