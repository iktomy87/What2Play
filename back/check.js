const mongoose = require('mongoose');
require('dotenv').config();

const Game = mongoose.model('Games', new mongoose.Schema({
    nombre: String,
    cpuScore: Number,
    gpuScore: Number
}, {strict: false}));

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const games = await Game.find({});
    console.log(games.map(g => `${g.nombre} | CPU: ${g.cpuScore} | GPU: ${g.gpuScore}`).join('\n'));
    mongoose.disconnect();
}).catch(console.error);
