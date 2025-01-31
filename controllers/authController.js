const User = require("../models/User");
const Team = require("../models/Team");
const Player = require("../models/Player");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerOrLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, password });
      await user.save();

      const teamName = email.split("@")[0];

      const existingTeam = await Team.findOne({ name: teamName });
      if (existingTeam) {
        return res.status(400).json({ message: "Team name already exists" });
      }

      const team = new Team({
        user: user._id,
        budget: 5000000,
        name: teamName,
      });
      await team.save();

      const unassignedPlayers = await Player.find({ team: { $exists: false } });

      const selectedPlayers = selectRandomPlayers(unassignedPlayers);

      team.players = selectedPlayers.map((player) => player._id);
      await team.save();

      await Player.updateMany(
        { _id: { $in: selectedPlayers.map((player) => player._id) } },
        { $set: { team: team._id } }
      );

      user.team = team._id;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const selectRandomPlayers = (players) => {
  const goalkeepers = players.filter(
    (player) => player.position === "Goalkeeper"
  );
  const defenders = players.filter((player) => player.position === "Defender");
  const midfielders = players.filter(
    (player) => player.position === "Midfielder"
  );
  const attackers = players.filter((player) => player.position === "Attacker");

  const selectedGoalkeepers = getRandomSubset(goalkeepers, 3);
  const selectedDefenders = getRandomSubset(defenders, 6);
  const selectedMidfielders = getRandomSubset(midfielders, 6);
  const selectedAttackers = getRandomSubset(attackers, 5);

  return [
    ...selectedGoalkeepers,
    ...selectedDefenders,
    ...selectedMidfielders,
    ...selectedAttackers,
  ];
};

const getRandomSubset = (players, count) => {
  const shuffled = players.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

module.exports = { registerOrLogin };
