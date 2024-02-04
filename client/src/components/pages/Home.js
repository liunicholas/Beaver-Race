import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useParams } from "react-router-dom";

import "../../utilities.css";
import "./Home.css";

import successful_beaver from "../../public/assets/beavers/successful_beaver.png";
import unsuccessful_beaver from "../../public/assets/beavers/unsuccessful_beaver.png";
import beaver_background from "../../public/assets/beavers/beaver-background.png";

import beaver_image from "../../public/assets/beavers/beaver_picture.png";

import { get, post } from "../../utilities";

import Leaderboard from "../modules/Leaderboard.js";

// This code is modified from https://stackoverflow.com/questions/37317622/24-math-game-random-number-generator-and-solver-in-javascript
// The code had issues with prob, so we fixed it
function getNumberGame(target, length) {
	// console.clear();
	var dataset = [];
	var datavalue = 0;
	var methods = {
		'add' : function (a, b) {
			return (a + b);
		},
		'subtract' : function (a, b) {
			return a - b;
		},
		'multiply' : function (a, b) {
			if (a !== 0 && b !== 0 && a < Infinity && b < Infinity) {
				return Math.round(a * b);
			} else {
				return false;
			}
		},
		'divide' : function (a, b) {
			if (a !== 0 && b !== 0 && a < Infinity && b < Infinity) {
        if (a % b !== 0) {
          return 99999;
        }
				return Math.round(a / b);
			} else {
				return false;
			}
		}
	}
	for (var i = 0; i < length - 1; i++) {
		var obj = {
			value : Math.round(Math.random() * target) + 1,
			method : Object.keys(methods)[Math.floor(Math.random() * Object.keys(methods).length)]
		};
		dataset.push(obj);
	}
	delete dataset[0].method;
	var data = dataset[0].value * 1;
	// console.log('Start with ' + data);
	for (var i = 1; i < dataset.length; i++) {
		data = methods[dataset[i].method](data, dataset[i].value);
		// console.log(dataset[i].method + " " + dataset[i].value + " to get " + data);
	}
	if (data > target) {
		dataset.push({
			value : Math.round(Math.abs(data - target)),
			method : 'subtract'
		});
		// console.log("subtract " + dataset[dataset.length - 1].value + " to get " + 24);
	} else if (data < target) {
		dataset.push({
			value : Math.round(Math.abs(data - target)),
			method : 'add'
		});
		// console.log("add " + dataset[dataset.length - 1].value + " to get " + 24);
	}
	var returnArray = [];
	while (dataset.length > 0) {
		var i = Math.floor(Math.random() * dataset.length);
		returnArray.push(dataset[i].value);
		dataset.splice(i, 1);
	}
  if (returnArray[0] > 24 || returnArray[1] > 24 || returnArray[2] > 24 || returnArray[3] > 24 || returnArray.length !== 4) {
    return getNumberGame(target, length);
  }
  else {
    return returnArray;
  }
}

export const getRandomProblem = (game) => {
    if (game.title === "Arithmetic") {
        let sign = Math.floor(Math.random() * 2); // 0 = +, *, 1 = -, /
        let num1 = 0;
        let num2 = 0;
        if (sign === 0) {
            num1 = Math.floor(Math.random() * 98) + 2;
            num2 = Math.floor(Math.random() * 98) + 2;
        } else {
            num1 = Math.floor(Math.random() * 10) + 2;
            num2 = Math.floor(Math.random() * 98) + 2;
        }
    
        if (sign === 0) {
            if (Math.floor(Math.random() * 2) === 0) {
                return { question: `${num1} + ${num2}`, answer: `${num1 + num2}` };
            } else {
                return { question: `${num1 + num2} - ${num1}`, answer: `${num2}` };
            }
        } else {
            if (Math.floor(Math.random() * 2) === 0) {
                return { question: `${num1} x ${num2}`, answer: `${num1 * num2}` };
            } else {
                return { question: `${num1 * num2} ÷ ${num1}`, answer: `${num2}` };
            }
        }    
    }
    else if (game.title === "24") {
      let numbers = getNumberGame(24, 4);
      return { question: numbers.join(", "), answer: 24 };
    }
    else {
        let index = Math.floor(Math.random() * game.questions.length);
        return { question: game.questions[index], answer: game.answers[index] };
    }
};

const Home = (props) => {
    const [current_username, setCurrentUsername] = useState("");
    const [new_username, setNewUsername] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const [signInPrompt, setSignInPrompt] = useState(false);
    const [roundCode, setGameCode] = useState("");
    const [roundID, setRoundID] = useState("");
    const [game, setGame] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    // const [updateLeaderboard, setUpdateLeaderboard] = useState(false);

    let userId = props.userId;

    const navigate = useNavigate();

    let game_url = useParams().game_url;
    useEffect(() => {
        if (game_url === undefined) {
            const newGame = {title: "Arithmetic", url: "arithmetic"};
            setGame(newGame);
            setIsLoading(false);
        }
        else {
            // console.log(game_url);
            get(`/api/get_game_by_url`, { url: game_url }).then((game) => {
                setGame(game);
                // console.log(game);
                setIsLoading(false);
            })
            .catch(() => {
                navigate("/404");
            });
        }
    }, []);

    useEffect(() => {
        if (userId) {
            get(`/api/get_user_by_id`, { userId: userId }).then((user) => {
                setCurrentUsername(user.username);
            });
        }
    }, [userId]);

    const tryGameCode = () => {
      if (roundCode.length !== 6) {
        setGameCode("");
        return;
      }
      navigate(`/race/?id=${roundCode}`);
      setGameCode("");
    };

    const updateUsername = () => {
        post("/api/updateusername", { userId: userId, username: new_username }).then((res) => {
            if (res.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    setCurrentUsername(new_username);
                    setNewUsername("");
                }, 2000);
            } else {
                setShowFailure(true);
                setTimeout(() => {
                    setShowFailure(false);
                    setNewUsername("");
                }, 2000);
            }
        });
    };

    const showSignInPrompt = () => {
        setSignInPrompt(true);
        setTimeout(() => {
            setSignInPrompt(false);
        }, 2000);
    };

    useEffect(() => {
        const konamiCodeSequence = [
            "ArrowUp",
            "ArrowUp",
            "ArrowDown",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "ArrowLeft",
            "ArrowRight",
            "b",
            "a",
            "Enter",
        ];
        let currentInput = [];

        const handleKeyDown = (event) => {
            currentInput.push(event.key);

            // Ensure the length of current input does not exceed the Konami Code length
            currentInput = currentInput.slice(-konamiCodeSequence.length);

            if (JSON.stringify(currentInput) === JSON.stringify(konamiCodeSequence)) {
                // Change CSS variable when Konami Code is entered
                document.documentElement.style.setProperty("--primary", "#212121");
                document.documentElement.style.setProperty("--secondary", "#FF8C00");
                document.documentElement.style.setProperty("--button--text", "#212121");
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const createMultiplayerRound = async () => {
        // console.log("started...");
        let questions = [];
        let answers = [];
        const num_questions = game.questions_per_round
        for (let i = 0; i < num_questions+1; i++) {
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
            // console.log("Problem Set: " + problemSetID);
            // console.log("Game: " + game.url);
            const newRoundRes = await post("/api/create_indiv_round", {
                problem_set_id: problemSetID,
                game_url: game.url,
            });
            const createdRoundID = newRoundRes._id;
            setRoundID(createdRoundID);
            // console.log("Round: " + createdRoundID);
            // post("/api/initsocket", { socketid: socket.id });
            const shortenedRoundID = createdRoundID.slice(-6).toUpperCase();
            // navigate(`/race?id=${createdRoundID}`);
            navigate(`/race/?id=${shortenedRoundID}`);
        } catch (error) {
            // console.log(error);
            // console.log("error creating problem set or round :(");
        }
    };

    // function getImage(game) {
    //   try {
    //       // console.log(game.url);
    //       return require(`../../public/assets/beavers/${game.url}.png`).default;
    //   } catch (err) {
    //       // console.log(err);
    //       return require(`../../public/assets/beavers/default-game.png`).default;
    //   }
    // }

    const backgroundImageStyle = () => {
        return {
          // backgroundImage: `url(${getImage(game)})`,
          backgroundImage: `url(${beaver_background})`,
          backgroundPosition: 'center',
          filter: 'blur(1px)',
          zIndex: -1,
        };
    };

    function hashStringToNumber(s) {
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
          const char = s.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }

    const colorWheel = [
      '#4f6377', '#4f6377', '#506477', '#506477', '#506577', '#506577', '#516677', '#516677', '#516777', '#526776',
      '#526776', '#526876', '#526876', '#536976', '#536976', '#536a76', '#546a76', '#546b76', '#546b76', '#546b76',
      '#556c76', '#556c76', '#556d76', '#566d76', '#566e76', '#566e75', '#566f75', '#576f75', '#576f75', '#577075',
      '#577075', '#587175', '#587175', '#587275', '#597275', '#597375', '#597375', '#597375', '#5a7475', '#5a7475',
      '#5a7575', '#5b7575', '#5b7674', '#5b7674', '#5b7774', '#5c7774', '#5c7774', '#5c7874', '#5d7874', '#5d7974',
      '#5d7974', '#5d7a74', '#5e7a74', '#5e7b74', '#5e7b74', '#5f7b74', '#5f7c74', '#5f7c74', '#5f7d73', '#607d73',
      '#607e73', '#607e73', '#617f73', '#617f73', '#617f73', '#618073', '#628073', '#628173', '#628173', '#638273',
      '#638273', '#638373', '#638373', '#648373', '#648473', '#648472', '#648572', '#658572', '#658672', '#658672',
      '#668772', '#668772', '#668772', '#668872', '#678872', '#678972', '#678972', '#688a72', '#688a72', '#688b72',
      '#688b72', '#698b71', '#698c71', '#698c71', '#6a8d71', '#6a8d71', '#6a8e71', '#6a8e71', '#6b8f71', '#6b8f71'
    ];

    useEffect(() => {
      if (game.title) {
        const diff = 30
        const hashIndex = Math.abs(hashStringToNumber(game.url)) % (colorWheel.length-diff);
        const color1 = colorWheel[hashIndex];
        const color2 = "#6C574B";
        document.documentElement.style.setProperty("--primary", color1);
        document.documentElement.style.setProperty("--secondary", color2);  
        document.documentElement.style.setProperty("--primary--dim", color2);
        // Calculate the brightness of the color
        const brightness1 = Math.round(((parseInt(color1[0]) * 299) +
        (parseInt(color1[1]) * 587) +
        (parseInt(color1[2]) * 114)) / 1000);

        // If the color is bright, set --text to black, otherwise set it to white
        const textColor1 = brightness1 > 125 ? 'black' : 'white';
        document.documentElement.style.setProperty("--text", textColor1);

        // Calculate the brightness of the color
        const brightness2 = Math.round(((parseInt(color2[0]) * 299) +
        (parseInt(color2[1]) * 587) +
        (parseInt(color2[2]) * 114)) / 1000);

        // If the color is bright, set --text to black, otherwise set it to white
        const textColor2 = brightness2 > 125 ? 'black' : 'white';
        document.documentElement.style.setProperty("--button--text", textColor2);
      }
    }, [game])

    return (
      <>
        {isLoading ? null : (
          <>
            <div style={backgroundImageStyle()} className="Home-background"></div>
            {showSuccess && (
              <div className="Home-fade-div Home-username-text">
                {" "}
                <img src={successful_beaver} className="Home-fade-image" />{" "}
                <div>Hi {new_username}!</div>
              </div>
            )}
            {signInPrompt && (
              <div className="Home-fade-div Home-username-text">
                {" "}
                <img src={successful_beaver} className="Home-fade-image" />{" "}
                <div>Sign in on the top right!</div>
              </div>
            )}
            {showFailure && (
              <div className="Home-fade-div Home-username-text">
                {" "}
                <img src={unsuccessful_beaver} className="Home-fade-image" />{" "}
                <div>{new_username} is not valid</div>
              </div>
            )}
            <div className="Home-container">
              <div className="Home-main-rounded-div Home-sign-in">
                {userId ? (
                  <>
                    <div className="u-inlineBlock Home-subheadline-text Home-username-text Home-typing-animation">
                      Welcome to Beaver World, {current_username}!
                    </div>
                    <input
                      className="u-inlineBlock Home-username-button Home-white-placeholder Home-align-right Home-subheadline-text"
                      placeholder="Enter Username"
                      type="text"
                      value={new_username}
                      onChange={(e) => setNewUsername(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // prevent form submission
                          updateUsername();
                        }
                      }}
                    ></input>
                  </>
                ) : (
                  <div className="u-inlineBlock Home-subheadline-text" onClick={showSignInPrompt}>
                    Sign in to change your username and view your stats!
                  </div>
                )}
              </div>
              <div className="Home-main-rounded-div Home-multiplayer-random">
                <div className="Home-headline-text">
                  The {game.title} Race
                </div>
                <div className="Home-subheadline-text">
                  Race your beaver friends in {game.title}!
                </div>
                {userId ? (
                    <button
                    className="u-pointer Home-button Home-mathing-race-button"
                    onClick={createMultiplayerRound}
                    >
                    Create Party
                    </button>
                ) : (
                  <button className="u-pointer Home-party-sign-in" onClick={showSignInPrompt}>
                    Sign in to create a party!
                  </button>
                )}
              </div>
              <div className="Home-two-divs">
                <div className="Home-main-rounded-div Home-individual">
                  <div className="Home-headline-text">Individual Practice</div>
                  <div className="Home-subheadline-text">
                    Practice your skills on your own!
                  </div>
                  <Link to={`/${game.url}/indiv`}>
                    <button className="u-pointer Home-button Home-practice-yourself-button">
                      Practice Race
                    </button>
                  </Link>
                  {/* <img src={lonely_beaver} className="Home-individual-image" /> */}
                </div>
                <div className="Home-main-rounded-div Home-multiplayer-party">
                  <div className="Home-headline-text">Race Your Friends</div>
                  <div className="Home-subheadline-text">
                    Join a river to race your beaver friends!
                  </div>
                  {userId ? (
                    <>
                      <button
                            className="u-pointer Home-button Home-create-party-button"
                            onClick={tryGameCode}
                        >
                            Join Party
                        </button>
                      <input
                        className="u-inlineBlock Home-round-code Home-white-placeholder"
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
                    </>
                  ) : (
                    <button className="u-pointer Home-party-sign-in" onClick={showSignInPrompt}>
                      Sign in to join a party!
                    </button>
                  )}
                </div>
              </div>
              <div className="Home-main-rounded-div Home-headline-text Home-leaderboard">
                { game.title && <Leaderboard userId={userId} current_username={current_username} gameTitle={game.title} /> }
              </div>
            </div>
          </>
        )}
      </>
    );
};

export default Home;