import React, { useState, useEffect } from "react";
import Timer from "../modules/Timer.js";
import Question from "../modules/Question.js";

import "./RoundEndScoreboard.css";

import { get, post } from "../../utilities.js";

const RoundEndScoreboard = (props) => {
    let multiplayer = props.multiplayer;
    let scores = props.scores;
    if (multiplayer) {
        return <div>multiplayer scores</div>;
    } else {
        return <div className="RoundEndScoreboard-container">Score: {scores[0]}</div>;
    }
};

export default RoundEndScoreboard;
