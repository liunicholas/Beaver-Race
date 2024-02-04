import React from "react";
import "./Scoreboard.css";

const Scoreboard = (props) => {
    const { user_ids, scores } = props;

    return (
        <div className="Scoreboard-container">
            <p>Race Status</p>
            {user_ids.map((userId, index) => (
                <div key={userId} className="Scoreboard-item">
                    <span>User ID: {userId}</span>
                    <span>Score: {scores[index]}</span>
                </div>
            ))}
        </div>
    );
};

export default Scoreboard;
