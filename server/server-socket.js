const gameLogic = require("./game-logic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const socketToGameMap = {};
const userToGameMap = {};
const userToUsernameMap = {};

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];
const getGameFromSocketID = (socketid) => socketToGameMap[socketid];
const getGameFromUserID = (userid) => userToGameMap[userid];
const getUsernameFromUserID = (userid) => userToUsernameMap[userid];

const sendGameState = (roundID) => {
   // // console.log("updates emitted to " + roundID);
   // console.log(gameLogic.roundState);
    io.to(roundID).emit("update", gameLogic.roundState);
};

const startRunningGame = (roundID) => {
    let intervalId = setInterval(() => {
        gameLogic.updateGameState();
        sendGameState(roundID);
    }, 1000 / 20); // 1 fps right now

    // setTimeout(() => {
    //     clearInterval(intervalId);
    // }, 60000);
};

const addUser = (user, socket) => {
    // Disconnect old socket if it exists
    const oldSocket = userToSocketMap[user._id];
    if (oldSocket && oldSocket.id !== socket.id) {
        oldSocket.disconnect();
        delete socketToUserMap[oldSocket.id];
    }

    // Initializes stuff for the round
    // console.log("ADDING!! " + user._id + " and " + socket.id);
    userToSocketMap[user._id] = socket;
    socketToUserMap[socket.id] = user;
    // userToGameMap[user._id] = getGameFromSocketID(socket.id);
};

const removeUser = (user, socket) => {
    // console.log("DELETING!! " + user._id);
    if (user) delete userToSocketMap[user._id];
    delete socketToUserMap[socket.id];
};

module.exports = {
    init: (http) => {
        io = require("socket.io")(http);

        io.on("connection", (socket) => {
            // console.log(`socket has connected ${socket.id}`);
            let roundID = null;
            // console.log("this is the round ID: " + roundID);
            socket.on("joinGame", (newGameID, username) => {
                // console.log("new round: " + newGameID);
                // console.log("socket: " + socket.id);
                // console.log("round to socket mapping");
                // console.log(socketToGameMap);
                // can access user immediately
                let currGame = null;
                try {
                    currGame = getGameFromUserID(getUserFromSocketID(socket.id)._id);
                } catch (error) {
                    // console.log("lol didn't work");
                }

                if (currGame !== newGameID) {
                    // console.log("printing socket to user map");
                    // console.log(socketToUserMap);
                    try {
                        const userID = getUserFromSocketID(socket.id)._id;

                        roundID = newGameID;
                        socket.join(newGameID);
                        socketToGameMap[socket.id] = newGameID;
                        userToGameMap[userID] = newGameID;
                        userToUsernameMap[userID] = username;

                        // console.log("S to U MAP!");
                        // console.log(socketToUserMap);
                        // console.log("Socket ID: " + socket.id);

                        gameLogic.spawnPlayer(userID, username, newGameID);
                        startRunningGame(newGameID);
                    }
                    catch {}
                } else {
                    // gameLogic.roundInProgress();
                    // console.log("rip already in round");
                    socket.emit("alreadyInGame");
                    //
                }
            });
            socket.on("leaveGame", (roundID) => {
                socket.leave(roundID);
                // delete socketToGameMap[socket.id];
                // removeUser(getUserFromSocketID(socket.id), socket, roundID);
            });
            socket.on("finishGame", (roundID, userID) => {
                gameLogic.finishGame(roundID, userID);
            });
            socket.on("disconnect", (reason) => {
                // const user = getUserFromSocketID(socket.id);
                // removeUser(user, socket, roundID);
            });
            socket.on("move", () => {
                const user = getUserFromSocketID(socket.id);
                if (user) gameLogic.movePlayer(user._id, roundID);
            });
            socket.on("startGame", (roundID) => {
                gameLogic.startGame(roundID);
            });
            socket.on("newGame", (roundID, shortenedRoundID) => {
                gameLogic.newGame(roundID, shortenedRoundID);
            });
        });
    },

    addUser: addUser,
    removeUser: removeUser,

    getSocketFromUserID: getSocketFromUserID,
    getUserFromSocketID: getUserFromSocketID,
    getSocketFromSocketID: getSocketFromSocketID,
    getAllConnectedUsers: getAllConnectedUsers,
    getIo: () => io,
};
