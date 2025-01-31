const Player = require("../models/Player");

const playerNames = [
  "Liam",
  "Noah",
  "Oliver",
  "Elijah",
  "James",
  "William",
  "Benjamin",
  "Lucas",
  "Henry",
  "Alexander",
  "Mason",
  "Michael",
  "Ethan",
  "Daniel",
  "Jacob",
  "Logan",
  "Jackson",
  "Levi",
  "Sebastian",
  "Mateo",
  "Jack",
  "Owen",
  "Theodore",
  "Aiden",
  "Samuel",
  "Joseph",
  "John",
  "David",
  "Wyatt",
  "Matthew",
];

const positions = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

const generatePlayers = async (teamId) => {
  const positionCounts = {
    Goalkeeper: 3,
    Defender: 7,
    Midfielder: 7,
    Attacker: 6,
  };

  const players = [];
  let usedNames = new Set();

  for (const position in positionCounts) {
    for (let i = 0; i < positionCounts[position]; i++) {
      let name;

      do {
        name = playerNames[Math.floor(Math.random() * playerNames.length)];
      } while (usedNames.has(name));

      usedNames.add(name);

      const player = new Player({
        name,
        position,
        price: Math.floor(Math.random() * 500000) + 50000,
        teamId,
      });

      players.push(player);
    }
  }

  for (let i = 0; i < 7; i++) {
    let name;
    do {
      name = playerNames[Math.floor(Math.random() * playerNames.length)];
    } while (usedNames.has(name));

    usedNames.add(name);

    const randomPosition =
      positions[Math.floor(Math.random() * positions.length)];

    players.push(
      new Player({
        name,
        position: randomPosition,
        price: Math.floor(Math.random() * 500000) + 50000,
        teamId,
      })
    );
  }

  await Player.insertMany(players);
  console.log("30 random players created successfully!");
};

module.exports = generatePlayers;
