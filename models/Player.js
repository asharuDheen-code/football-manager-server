const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    enum: ["Goalkeeper", "Defender", "Midfielder", "Attacker"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  onTransfer: {
    type: Boolean,
    default: false,
  },
  askingPrice: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Player", PlayerSchema);
