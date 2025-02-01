const { faker } = require("@faker-js/faker");
const Player = require("../models/Player");

const positions = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

const generatePlayers = async (teamId) => {
  const positionCounts = {
    Goalkeeper: 3,
    Defender: 7,
    Midfielder: 7,
    Attacker: 6,
  };

  const players = new Set();

  while (players.size < 500) {
    players.add(faker.person.firstName());
  }

  const playersArray = [...players];
  const finalPlayers = [];

  let index = 0;
  for (const position in positionCounts) {
    for (let i = 0; i < positionCounts[position]; i++) {
      finalPlayers.push(
        new Player({
          name: playersArray[index++],
          position,
          price: Math.floor(Math.random() * 500000) + 50000,
          teamId,
        })
      );
    }
  }

  while (index < 500) {
    finalPlayers.push(
      new Player({
        name: playersArray[index++],
        position: positions[Math.floor(Math.random() * positions.length)],
        price: Math.floor(Math.random() * 500000) + 50000,
        teamId,
      })
    );
  }

  await Player.insertMany(finalPlayers);
  console.log("30 random players created successfully!");
};

module.exports = generatePlayers;
