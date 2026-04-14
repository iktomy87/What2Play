const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const Game = mongoose.model('Games', new mongoose.Schema({
    nombre: String,
    cpuScore: Number,
    gpuScore: Number
}, {strict: false}));

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const games = await Game.find({});
    const lines = games.map(g => `${g.nombre} | CPU: ${g.cpuScore} | GPU: ${g.gpuScore}`).join('\n');
    fs.writeFileSync('db-dump.txt', lines);
    console.log("Done");
    mongoose.disconnect();
}).catch(console.error);
