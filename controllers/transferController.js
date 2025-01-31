const Player = require("../models/Player");
const Team = require("../models/Team");
const Transfer = require("../models/Transfer");

const getTransferMarket = async (req, res) => {
  try {
    const players = await Player.find({ isOnTransferList: true }).populate(
      "team"
    );

    const myTeam = await Team.findOne({ user: req.userId }).populate("players");

    res.json({
      players,
      myTeamPlayers: myTeam.players,
    });
  } catch (err) {
    console.error("Error fetching transfer market:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const toggleTransferList = async (req, res) => {
  const { playerId, isOnTransferList, askingPrice } = req.body;

  try {
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const fromTeam = await Team.findOne({ players: playerId });
    if (!fromTeam) {
      return res.status(404).json({ message: "Player's team not found" });
    }

    // Check if the player is already on the transfer list
    if (isOnTransferList) {
      const existingTransfer = await Transfer.findOne({
        player: playerId,
        status: "Pending",
      });
      if (existingTransfer) {
        return res
          .status(400)
          .json({ message: "Player is already on the transfer list" });
      }
    } else {
      // Remove the pending transfer if the player is taken off the transfer list
      await Transfer.deleteOne({ player: playerId, status: "Pending" });
    }

    // Toggle the transfer list status and update the player's asking price
    player.isOnTransferList = isOnTransferList;
    player.askingPrice = askingPrice;
    await player.save();

    if (isOnTransferList) {
      const transfer = new Transfer({
        player: playerId,
        fromTeam: fromTeam._id,
        toTeam: null,
        price: askingPrice,
        status: "Pending",
      });
      await transfer.save();
    }

    const myTeam = await Team.findOne({ user: req.userId }).populate("players");

    res.json({
      players: myTeam.players,
    });
  } catch (err) {
    console.error("Error toggling transfer list:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const buyPlayer = async (req, res) => {
  const { playerId, price } = req.body;
  console.log("buyPlayer", req.body);

  try {
    const player = await Player.findById(playerId).populate("team");
    if (!player) {
      console.log("Player not found in database");
      return res.status(404).json({ message: "Player not found" });
    }

    if (!player.isOnTransferList) {
      console.log("Player is not on the transfer list");
      return res
        .status(400)
        .json({ message: "Player not available for transfer" });
    }

    const buyerTeam = await Team.findOne({ user: req.userId });
    if (!buyerTeam) {
      console.log("Buyer team not found");
      return res.status(404).json({ message: "Buyer team not found" });
    }

    if (buyerTeam.budget < price) {
      console.log("Insufficient budget");
      return res.status(400).json({ message: "Insufficient budget" });
    }

    if (buyerTeam.players.length >= 25) {
      console.log("Team cannot have more than 25 players");
      return res
        .status(400)
        .json({ message: "Team cannot have more than 25 players" });
    }

    buyerTeam.budget -= price;
    await buyerTeam.save();

    const sellerTeam = await Team.findById(player.team);
    sellerTeam.budget += price;
    await sellerTeam.save();

    player.team = buyerTeam._id;
    player.isOnTransferList = false;
    player.askingPrice = 0;
    await player.save();

    buyerTeam.players.push(player._id);
    await buyerTeam.save();

    sellerTeam.players = sellerTeam.players.filter(
      (p) => p.toString() !== player._id.toString()
    );
    await sellerTeam.save();

    await Transfer.findOneAndUpdate(
      { player: playerId, status: "Pending" },
      { toTeam: buyerTeam._id, status: "Completed" }
    );

    const players = await Player.find({ isOnTransferList: true }).populate(
      "team"
    );
    const myTeam = await Team.findOne({ user: req.userId }).populate("players");

    res.json({
      players,
      myTeamPlayers: myTeam.players,
    });
  } catch (err) {
    console.error("Error buying player:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTransferList = async (req, res) => {
  try {
    const transfers = await Transfer.find({ status: "Pending" })
      // .populate("player")
      .populate({
        path: "player",
        populate: { path: "team", select: "name budget" }, // Populating team details
      })
      .populate("fromTeam")
      // .populate("Team")
      .sort({ createdAt: -1 });
    res.json({ transfers });
  } catch (err) {
    console.error("Error fetching transfer list:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTransferMarket,
  toggleTransferList,
  buyPlayer,
  getTransferList,
};
