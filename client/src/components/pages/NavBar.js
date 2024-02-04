import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";

import BeaverRaceLogo from "../../public/assets/beavers/BeaverIcon.png";

import "./NavBar.css";

// This identifies your web application to Google's authentication service
const GOOGLE_CLIENT_ID = "956478673522-odt9nc158u9obsuqpeb16s3uiabon4lf.apps.googleusercontent.com";

const NavBar = ({ userId, handleLogin, handleLogout }) => {
    const [roundCode, setGameCode] = useState("");
    const navigate = useNavigate();
    
    const tryGameCode = () => {
      if (roundCode.length !== 6) {
        setGameCode("");
        return;
      }
      navigate(`/race/?id=${roundCode}`);
      setGameCode("");
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <nav className="NavBar-container">
                <Link to="/">
                    {/* <div className="u-inlineBlock NavBar-align-top">
                        <img src={BeaverRaceLogo} alt="" className="NavBar-image" />
                    </div> */}
                    <div className="u-inlineBlock NavBar-align-top NavBar-title-beaver">Beaver</div>
                    <div className="u-inlineBlock NavBar-align-top NavBar-title-race">Race</div>
                </Link>

                <Link to="/">
                    <button className="NavBar-button">Play More Games!</button>
                </Link>

                <Link to="/create-game">
                    <button className="NavBar-button">Create Game</button>
                </Link>

                {/* <a
                    href="https://forms.gle/hhnryvakyackzM467"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <button className="NavBar-button">Report Bug</button>
                </a> */}

                <div className="u-inlineBlock NavBar-auth-button">
                    {userId ? (
                        <>
                        <input
                            className="u-inlineBlock NavBar-game-code Home-white-placeholder"
                            placeholder="Enter Code"
                            type="text"
                            value={roundCode}
                            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault(); // prevent form submission
                                tryGameCode();
                            }
                            }}
                        ></input>
                        <button
                            className="u-pointer NavBar-sign-in-button"
                            onClick={() => {
                                googleLogout();
                                handleLogout();
                            }}
                        >
                            Logout
                        </button>
                        </>
                    ) : (
                        <GoogleLogin onSuccess={handleLogin} onError={(err) => console.log(err)} />
                    )}
                </div>
            </nav>
        </GoogleOAuthProvider>
    );
};

export default NavBar;
