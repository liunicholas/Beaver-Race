import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import NavBar from "./pages/NavBar.js";
import Footer from "./pages/Footer.js";

import jwt_decode from "jwt-decode";

import NotFound from "./pages/NotFound.js";
import Home from "./pages/Home.js";
import Race from "./pages/Race.js";
import Indiv from "./pages/Indiv.js";
import OtherGames from "./pages/OtherGames.js";
import CreateGame from "./pages/CreateGame.js";

import "../utilities.css";

import { socket } from "../client-socket.js";

import { get, post } from "../utilities";

/**
 * Define the "App" component
 */
const App = () => {
    const [userId, setUserId] = useState(undefined);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const path = location.pathname;
        const match = path.match(/^\/(\w{6})$/);
        if (match) {
            const id = match[1];
            navigate(`/race?id=${id}`, { replace: true });
        }
    }, [location, navigate]);

    useEffect(() => {
        get("/api/whoami").then((user) => {
            if (user._id) {
                // they are registed in the database, and currently logged in.
                setUserId(user._id);
            }
        });
    }, []);

    const handleLogin = (credentialResponse) => {
        const userToken = credentialResponse.credential;
        const decodedCredential = jwt_decode(userToken);
        // console.log(`Logged in as ${decodedCredential.name}`);
        post("/api/login", { token: userToken }).then((user) => {
            setUserId(user._id);
            post("/api/initsocket", { socketid: socket.id });
            if (user.username === "") {
                // console.log("No username");
            } else {
                // console.log(user.username);
            }
        });
    };

    const handleLogout = () => {
        setUserId(undefined);
        post("/api/logout");
    };

    return (
        <>
            <NavBar handleLogin={handleLogin} handleLogout={handleLogout} userId={userId} />
            <Routes>
                <Route path="/" element={<OtherGames path="/" userId={userId} />} />
                <Route path="/race" element={<Race path="/race" userId={userId} />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="/:game_url/indiv" element={<Indiv path="/:game_url/indiv" userId={userId} />} />
                {/* <Route path="/other_games" element={<OtherGames path="/other_games" userId={userId} />} /> */}
                <Route path="/:game_url" element={<Home path="/:game_url" userId={userId} />} />
                <Route path="/create-game" element={<CreateGame path="/create-game" userId={userId} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            {/* <Footer userId={userId} /> */}
        </>
    );
};

export default App;
