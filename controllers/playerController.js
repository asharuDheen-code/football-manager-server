const Player = require("../models/Player");

const buyPlayer = async (playerId, buyerId) => {
  const player = await Player.findById(playerId);
  if (!player || player.transferListed === false) {
    throw new Error("Player not available for transfer");
  }

  const buyer = await User.findById(buyerId).populate("team");
  if (buyer.team.budget < player.price * 0.95) {
    throw new Error("Insufficient funds");
  }

  buyer.team.budget -= player.price * 0.95;
  buyer.team.players.push(player);
  await buyer.team.save();

  player.team = buyer.team;
  player.transferListed = false;
  await player.save();
};

const getPlayer = async (req, res) => {
  try {
    const players = await Player.find();

    if (players.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No players found" });
    }

    return res.status(200).json({ success: true, data: players });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { buyPlayer, getPlayer };
