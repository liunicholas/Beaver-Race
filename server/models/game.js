const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    title: String,
    url: String,
    skip_time: Number,
    questions_per_round: Number,
    time_per_round: Number,
    verified: String,
    questions: [String],
    answers: [String],
});

module.exports = mongoose.model("game", GameSchema);
