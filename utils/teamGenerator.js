const Team = require("../models/Team");
const Player = require("../models/Player");

const generateTeam = async (userId) => {
  const team = new Team({ user: userId });

  const players = [
    ...Array(3)
      .fill()
      .map(
        () =>
          new Player({
            name: "Goalkeeper",
            position: "Goalkeeper",
            price: 100000,
            team: team._id,
          })
      ),
    ...Array(6)
      .fill()
      .map(
        () =>
          new Player({
            name: "Defender",
            position: "Defender",
            price: 150000,
            team: team._id,
          })
      ),
    ...Array(6)
      .fill()
      .map(
        () =>
          new Player({
            name: "Midfielder",
            position: "Midfielder",
            price: 200000,
            team: team._id,
          })
      ),
    ...Array(5)
      .fill()
      .map(
        () =>
          new Player({
            name: "Attacker",
            position: "Attacker",
            price: 250000,
            team: team._id,
          })
      ),
  ];

  await Player.insertMany(players);
  team.players = players.map((player) => player._id);
  await team.save();

  return team;
};

module.exports = { generateTeam };
