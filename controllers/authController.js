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
      // Register new user
      user = new User({ email, password });
      await user.save();

      // Generate team name from email (part before @)
      const teamName = email.split("@")[0];

      // Check if a team with the same name already exists
      const existingTeam = await Team.findOne({ name: teamName });
      if (existingTeam) {
        return res.status(400).json({ message: "Team name already exists" });
      }

      // Create a team for the user
      const team = new Team({
        user: user._id,
        budget: 5000000,
        name: teamName, // Use the generated team name
      });
      await team.save();

      // Fetch all players from the database
      const allPlayers = await Player.find({});

      // Select random players for the team
      const selectedPlayers = selectRandomPlayers(allPlayers);

      // Assign the selected players to the team
      team.players = selectedPlayers.map((player) => player._id);
      await team.save();

      // Update the players' team field
      await Player.updateMany(
        { _id: { $in: selectedPlayers.map((player) => player._id) } },
        { $set: { team: team._id } }
      );

      // Assign the team to the user
      user.team = team._id;
      await user.save();
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
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
