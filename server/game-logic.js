const NUM_QUESTIONS = 10;
const TRACK_LENGTH = 500;

// const roundState = {
//     players: [],
//     winner: null,
// };

const roundState = {};

const spawnPlayer = (id, username, roundID) => {
    // check if roundID is in roundState
    if (!(roundID in roundState)) {
        roundState[roundID] = {
            players: [],
            placings: [],
            winner: null,
            started: false,
            start_time: null, // maybe??
            new_round: null,
        };
    }
    // console.log(roundState);
    if (!(id in roundState[roundID]["players"])) {
        roundState[roundID]["players"].push({ id: id, username: username, score: 0 });
        // console.log("spawned!");
    }
};

const startGame = (roundID) => {
    roundState[roundID]["started"] = true;
    const now = new Date();
    roundState[roundID]["start_time"] = new Date(now.getTime() + 3 * 1000);
};

const removePlayer = (id, roundID) => {
    const index = roundState[roundID]["players"].indexOf(id);
    roundState[roundID]["players"].splice(index, 1);
    roundState[roundID]["players"].splice(index, 1);
};

const movePlayer = (id, roundID) => {
    // console.log(roundState);
    // console.log("moving...");
    // console.log(roundID);
    // console.log(roundState[roundID]);
    for (let i = 0; i < roundState[roundID]["players"].length; i++) {
        if (roundState[roundID]["players"][i].id === id) {
            roundState[roundID]["players"][i].score += 1;
        }
    }
};

const doesPlayerExist = (userID) => {
    return roundState.players.some((player) => player.userId === userId);
};

const finishGame = (roundID, userID) => {
    roundState[roundID]["placings"].push(userID);
};

const updateGameState = () => {};

const newGame = (roundID, shortenedRoundID) => {
    roundState[roundID]["new_round"] = shortenedRoundID;
};

module.exports = {
    roundState,
    spawnPlayer,
    removePlayer,
    movePlayer,
    updateGameState,
    doesPlayerExist,
    startGame,
    finishGame,
    newGame,
};
