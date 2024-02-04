const mongoose = require("mongoose");

const RoundSchema = new mongoose.Schema({
    creator: String, // _id of creator
    players: [String], // list of _ids of participants
    problem_set_id: String,
    player_scores: [Number],
    multiplayer: Boolean,
    started: Boolean,
    public: Boolean,
    game_url: String,
});

// compile model from schema
module.exports = mongoose.model("round", RoundSchema);
