import React from "react";
import CryingBeaver from "../../public/assets/beavers/crying beaver.png";

import "./NotFound.css";

const NotFound = () => {
    return (
        <div className="NotFound-container">
            <div className="NotFound-content">404 Not Found</div>
            <div className="NotFound-content">The page you requested couldn't be found</div>
            <div>
                <img src={CryingBeaver} alt="" className="NotFound-image" />
            </div>
        </div>
    );
};

export default NotFound;
