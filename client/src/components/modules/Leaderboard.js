import React, { useEffect, useState } from "react";
import "../../utilities.css";
import "./Leaderboard.css";

import { get, post } from "../../utilities";

const Leaderboard = (props) => {
    let userId = props.userId;
    let gameTitle = props.gameTitle;
    const [topUsers, setTopUsers] = useState([]);
    const [userAvgScore, setUserAvgScore] = useState(0);
    const [userHighScore, setUserHighScore] = useState(0);
    const [sortMethod, setSortMethod] = useState("avg");

    useEffect(() => {
        if (userId) {
            get(`/api/get_user_by_id`, { userId: userId, gameTitle: gameTitle}).then((user) => {
                let averageScore = 0;
                let highScore = 0;
                if (user.pastGames.hasOwnProperty(gameTitle)) {
                    const gameScores = user.pastGames[gameTitle];
                    averageScore =
                    gameScores.length === 0
                        ? 0
                        : gameScores.slice(-5).reduce((a, b) => a + b, 0) /
                        gameScores.slice(-5).length;
                    highScore = gameScores.length === 0 ? 0 : Math.min(...gameScores);
                } else {
                    averageScore = 0;
                    highScore = 0;
                };
                setUserAvgScore(averageScore);
                setUserHighScore(highScore);
            });
        }
    }, [userId]);

    useEffect(() => {
        get("/api/get_top_users", { sortMethod: sortMethod, gameTitle: gameTitle }).then((res) => {
            setTopUsers(res.users);
        });
    }, [sortMethod, props.current_username, props.notUpdatedgame, props.everyoneFinished]);

    return (
      <div className="Leaderboard-container">
        <div className="Leaderboard-header">
          <div className="u-inlineBlock Leaderboard-title">{gameTitle} Leaderboard</div>
          <div className="u-inlineBlock Leaderboard-sort">
            <button className="u-pointer Leaderboard-button" onClick={() => setSortMethod("avg")}>
              Sort by avg
            </button>
            <button className="u-pointer Leaderboard-button" onClick={() => setSortMethod("best")}>
              Sort by best
            </button>
          </div>
        </div>
        {userId ? (
          <div className="Leaderboard-your-stats">
            Your Stats: Avg {userAvgScore.toFixed(2)} spq | Best {userHighScore.toFixed(2)} spq
            (seconds per question)
          </div>
        ) : (
          <div className="Leaderboard-your-stats">Log in to see and save your stats!</div>
        )}

        {topUsers.map((user, index) => (
          <div
            className={` ${user._id === userId ? "Leaderboard-highlight" : "Leaderboard-player"}`}
            key={index}
          >
            <div className="u-inlineBlock">
              {index + 1}. {user.username}
            </div>
            <div className="u-inlineBlock">
              Avg{" "}
              {user.pastGames[gameTitle].length === 0
                ? 0
                : (
                    user.pastGames[gameTitle].slice(-5).reduce((a, b) => a + b, 0) /
                    user.pastGames[gameTitle].slice(-5).length
                  ).toFixed(2)}{" "}
              spq | Best{" "}
              {user.pastGames[gameTitle].length === 0
                ? 0
                : Math.min(...user.pastGames[gameTitle]).toFixed(2)}{" "}
              spq
            </div>
          </div>
        ))}
      </div>
    );
};

export default Leaderboard;
