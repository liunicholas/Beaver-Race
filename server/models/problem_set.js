// const mongoose = require("mongoose");

// const ProblemSetSchema = new mongoose.Schema({
//     name: String,
//     problems: [String],
//     });

// // compile model from schema
// module.exports = mongoose.model("user", UserSchema);

const mongoose = require("mongoose");

const ProblemSetSchema = new mongoose.Schema({
    questions: [String],
    answers: [String],
});

module.exports = mongoose.model("problem_set", ProblemSetSchema);
