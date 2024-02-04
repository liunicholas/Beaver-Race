import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Question from "../modules/Question.js";

import beaver_image from "../../public/assets/beavers/beaver_picture.png";
import beaver_background from "../../public/assets/beavers/beaver-background.png";
import logs from "../../public/assets/beavers/logs.png";

import { get, post } from "../../utilities.js";

import "../../utilities.css";
import "./Indiv.css";

import Leaderboard from "../modules/Leaderboard.js";

import { getRandomProblem } from "./Home";

const ROUND_TIME = 240;

// Page that displays all elements of a multiplayer race
const Indiv = (props) => {
    const [roundTimer, setRoundTimer] = useState(ROUND_TIME);
    const [newProblemSetID, setNewProblemSetID] = useState("");
    const [newRoundID, setNewRoundID] = useState("");
    const [roundStarted, setGameStarted] = useState(false);
    const [roundFinished, setGameFinished] = useState(false);
    const [spqScore, setSpqScore] = useState(0);
    const [score, setScore] = useState(0);
    const [notUpdatedGame, setNotUpdatedGame] = useState(true);
    const [createdNewRound, setCreatedNewRound] = useState(false);
    const roundFinishedRef = useRef(roundFinished);
    const [game, setGame] = useState({});
    const { game_url } = useParams();

    const [numQuestions, setNumQuestions] = useState(10);
    const numQuestionsRef = useRef(numQuestions);

    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        if (game_url) {
            get("/api/get_game_by_url", { url: game_url })
            .then((newGame) => {
                setGame(newGame);
                numQuestionsRef.current = newGame.questions_per_round;
            });
        }
    }, [game_url]);
    
    // Timer for the round (120 sec)
    useEffect(() => {
        let intervalTimer;
        // Start when the race starts, end when it's finished
        if (roundStarted && !roundFinished) {
            intervalTimer = setInterval(() => {
                setRoundTimer((roundTimer) => roundTimer - 0.01);
            }, 10); // Update every 0.01 sec
        }

        // Stop the timer if it reaches 0
        if (roundTimer <= 0) {
            // Restart states when the round finishes
            clearInterval(intervalTimer);
            setGameFinished(true);
            setRoundTimer(0);
            roundFinishedRef.current = true;

            // Clear from MongoDB
            post("/api/delete_problem_set_by_id", { problem_set_id: newProblemSetID });
            post("/api/delete_round_by_id", { round_id: newRoundID });
        }

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalTimer);
    }, [roundTimer, roundStarted]);

    // Check if the round is over
    useEffect(() => {
        if (score === numQuestionsRef.current) {
            setGameFinished(true);
            roundFinishedRef.current = true;
        }
    }, [score]);

    // Enter is how the round starts
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Enter" && score === 0) {
                setGameStarted(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Prevent default tab behavior
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Tab") {
                event.preventDefault();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const resetRound = async () => {
        setGameFinished(false);
        setGameStarted(false);
        setScore(0);
        setNewRoundID("");
        setRoundTimer(ROUND_TIME);
        setNotUpdatedGame(true);
        setCreatedNewRound(false);
        roundFinishedRef.current = false;
    };

    // Command + Enter to reset the round quickly
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                resetRound();
                setGameStarted(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const skipQuestion = () => {
        setRoundTimer(roundTimer - 5);
        setScore(score + 1);
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Tab" && roundStarted && !roundFinished) {
                setShowAnswer(true);    
                setTimeout(() => {
                    setShowAnswer(false);
                    skipQuestion();
                }, 2000);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    })

    // Enter to reset the round
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Enter" && roundFinishedRef.current) {
                resetRound();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // After the round is over, update the user's past rounds
    useEffect(() => {
        const updatePastGames = async () => {
            setSpqScore(((ROUND_TIME - roundTimer) / numQuestionsRef.current).toFixed(2));
            // console.log(roundFinished + " " + props.userId + " " + notUpdatedGame + " " + score);
            if (roundFinished && props.userId && notUpdatedGame && score > 0) {
                await post(`/api/update_user_pastrounds`, {
                    userId: props.userId,
                    score: numQuestionsRef.current,
                    time: ROUND_TIME - roundTimer,
                    gameTitle: game.title
                });
                setNotUpdatedGame(false);
            }
            if ((roundFinished && !props.userId) || (roundFinished && score === 0)) {
                setNotUpdatedGame(false);
            }
        };

        updatePastGames();
    }, [roundFinished]);

    useEffect(() => {
        const createProblemSetAndRound = async () => {
            let questions = [];
            let answers = [];
            for (let i = 0; i < numQuestionsRef.current+1; i++) {
                let newQuestion = ""
                while (true) {
                    newQuestion = getRandomProblem(game);
                    if (!questions.includes(newQuestion.question)) {
                        break;
                    }
                }
                questions.push(newQuestion.question);
                answers.push(newQuestion.answer);
            }

            try {
                const problemSetRes = await post("/api/create_problem_set", {
                    questions: questions,
                    answers: answers,
                });
                const problemSetID = problemSetRes._id;
                setNewProblemSetID(problemSetID);
                // console.log("Problem Set: " + problemSetID);

                const newRoundRes = await post("/api/create_indiv_round", {
                    problem_set_id: problemSetID,
                });
                const createdRoundID = newRoundRes._id;
                // console.log("Round: " + createdRoundID);

                return createdRoundID;
            } catch (error) {
                // console.log(error);
                // console.log("error creating problem set or round :(");
            }
        };

        if (!createdNewRound && Object.keys(game).length !== 0) {
            const changeRoundID = async () => {
                let createdRoundID = await createProblemSetAndRound();
                setNewRoundID(createdRoundID);
            };

            try {
                changeRoundID();
                setCreatedNewRound(true);
            } catch (error) {
                location.reload();
            }
        }
    }, [newRoundID, game]);

    const backgroundImageStyle = () => {
        return {
          backgroundImage: `url(${beaver_background})`,
          backgroundPosition: 'center',
          filter: 'blur(3px)',
          zIndex: -1,
        };
    };

    return (
        <>
        <div style={backgroundImageStyle()}className="Race-background"></div>
        <div className="Indiv-container">
            <div className="Indiv-round">
                {newRoundID === "" ? (
                    <div></div>
                ) : (
                    <div>
                        <div className="Indiv-roundTimer Indiv-headline-text">
                            <div className="u-inlineBlock">
                                {!roundFinished ? "Get to the logs asap!" : 
                                <Link to={`/${game.url}`}>
                                    <button className="Indiv-return-page">
                                        Return to game page
                                    </button>
                                </Link>
                                }
                            </div>
                            <div className="u-inlineBlock">
                                Remaining time: {roundTimer.toFixed(0)}
                            </div>
                        </div>
                        <div className="Indiv-beaver-river">
                            <div className="Indiv-beaver-bar">
                                <div style={{ marginLeft: `${score * 500/numQuestionsRef.current}px` }}>
                                    <img src={beaver_image} className="Indiv-beaver-image" />
                                </div>
                                <div
                                    className={`${score === numQuestionsRef.current ? "Indiv-highlighted-log" : "Indiv-log"}`}
                                >
                                    <img src={logs} className="Indiv-log-image" />
                                </div>
                            </div>
                        </div>
                        {roundStarted && !roundFinished && (
                            <Question roundID={newRoundID} score={score} setScore={setScore} showAnswer={showAnswer} game={game}/>
                        )}
                        {!roundStarted ? (
                            <div className="Indiv-round-start-container">
                                <button
                                    className="u-pointer Indiv-start-play-button"
                                    onClick={() => {
                                        setGameStarted(true);
                                    }}
                                >
                                    Press enter to start!
                                </button>
                            </div>
                        ) : (
                            <div></div>
                        )}
                    </div>
                )}
            </div>
            {roundFinished ? (
                <>
                    <div className="Indiv-round-finished-container">
                        Score: {spqScore} spq
                        <button className="u-pointer Indiv-play-again-button" onClick={resetRound}>
                            Press enter to play again!
                        </button>
                    </div>
                    <div className="Indiv-leaderboard">
                        <Leaderboard userId={props.userId} gameTitle={game.title} notUpdatedGame={notUpdatedGame}/>
                    </div>
                </>
            ) : (
                <div></div>
            )}
            {roundFinished ? null :
                <>
                    <div className="Race-key-presses">
                        Tab to skip question and see answer (5 second penalty)
                    </div>
                    <div className="Race-key-presses">
                        Ctrl or Cmd + Enter to restart
                    </div>
                </>
            }
        </div>
        </>
    );
};

export default Indiv;
